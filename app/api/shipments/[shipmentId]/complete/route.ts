// ============================================================
// POST /api/shipments/[shipmentId]/complete
// ============================================================
// Driver completes the shipment.
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

    // Usually drivers might transition from 'out_for_delivery' or 'picked_up'
    if (shipment.status !== 'picked_up' && shipment.status !== 'out_for_delivery') {
      return Response.json(
        { success: false, error: `Cannot complete shipment. Current status: ${shipment.status}` },
        { status: 400 }
      );
    }

    // Verify assignment
    const assignments = db.assignments.findByShipmentId(shipmentId);
    const driverAssignment = assignments.find(
      (a) => a.driverId === payload.userId && a.status === 'in_progress'
    );

    if (!driverAssignment) {
      return Response.json(
        { success: false, error: 'Not authorized for this shipment or shipment not in progress' },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    // Mark all drops as delivered (simplified logic, you could have a separate drop API)
    const updatedDrops = shipment.drops.map((drop) => ({
      ...drop,
      status: 'delivered' as const,
    }));

    // Update assignment
    db.assignments.update(driverAssignment.id, {
      status: 'completed',
    });

    // Update shipment
    const updatedShipment = db.shipments.update(shipmentId, {
      status: 'completed',
      drops: updatedDrops,
      updatedAt: now,
    });

    // Mark driver as available again
    db.driverProfiles.update(payload.userId, { status: 'available' });

    // Record status history
    db.statusHistory.create({
      id: generateId('sth'),
      shipmentId,
      fromStatus: shipment.status,
      toStatus: 'completed',
      changedBy: payload.userId,
      changedAt: now,
    });

    // Fire webhook
    if (updatedShipment) {
      const user = db.users.findById(payload.userId);
      const profile = db.driverProfiles.findByUserId(payload.userId);
      fireShipmentStatusWebhook(updatedShipment, 'shipment.completed', {
        id: payload.userId,
        name: user?.fullName || '',
        vehicleNumber: profile?.vehicleNumber || '',
        status: 'available',
      });
    }

    return Response.json({
      success: true,
      data: {
        shipmentId,
        status: 'completed',
        message: 'Shipment completed successfully.',
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
