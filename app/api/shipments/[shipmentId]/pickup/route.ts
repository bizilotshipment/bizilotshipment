// ============================================================
// POST /api/shipments/[shipmentId]/pickup
// ============================================================
// Driver confirms they have picked up the shipment.
// ============================================================

import { db } from '@/lib/db';
import { getUserFromRequest, generateId } from '@/lib/auth';
import { fireShipmentStatusWebhook } from '@/lib/webhooks';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;

    const payload = await getUserFromRequest(request);
    if (!payload || payload.role !== 'driver') {
      return Response.json(
        { success: false, error: 'Unauthorized. Driver access only.' },
        { status: 401 }
      );
    }

    // Find shipment
    const shipment = db.shipments.findById(shipmentId);
    if (!shipment) {
      return Response.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    if (shipment.status !== 'accepted') {
      return Response.json(
        { success: false, error: `Cannot confirm pickup. Current status: ${shipment.status}` },
        { status: 400 }
      );
    }

    // Verify assignment
    const assignments = db.assignments.findByShipmentId(shipmentId);
    const driverAssignment = assignments.find(
      (a) => a.driverId === payload.userId && a.status === 'assigned'
    );

    if (!driverAssignment) {
      return Response.json(
        { success: false, error: 'Not authorized for this shipment' },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    // Update assignment
    db.assignments.update(driverAssignment.id, {
      status: 'in_progress',
    });

    // Update shipment
    const updatedShipment = db.shipments.update(shipmentId, {
      status: 'picked_up',
      updatedAt: now,
    });

    // Record status history
    db.statusHistory.create({
      id: generateId('sth'),
      shipmentId,
      fromStatus: 'accepted',
      toStatus: 'picked_up',
      changedBy: payload.userId,
      changedAt: now,
    });

    // Fire webhook
    if (updatedShipment) {
      const user = db.users.findById(payload.userId);
      const profile = db.driverProfiles.findByUserId(payload.userId);
      fireShipmentStatusWebhook(updatedShipment, 'shipment.picked_up', {
        id: payload.userId,
        name: user?.fullName || '',
        vehicleNumber: profile?.vehicleNumber || '',
        status: 'busy',
      });
    }

    return Response.json({
      success: true,
      data: {
        shipmentId,
        status: 'picked_up',
        message: 'Pickup confirmed. Proceed to drops.',
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
