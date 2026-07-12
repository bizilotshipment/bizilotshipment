// ============================================================
// POST /api/shipments/[shipmentId]/accept
// ============================================================
// Driver accepts a shipment (entire pickup with all drops).
// ============================================================

import { db } from '@/lib/db';
import { getUserFromRequest, generateId, generateOTP } from '@/lib/auth';
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
    const shipment = await db.shipments.findById(shipmentId);
    if (!shipment) {
      return Response.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    if (shipment.status !== 'pending') {
      return Response.json(
        { success: false, error: `Shipment cannot be accepted. Current status: ${shipment.status}` },
        { status: 400 }
      );
    }

    // Check if already assigned
    const existingAssignments = await db.assignments.findByShipmentId(shipmentId);
    if (existingAssignments.some((a) => a.status === 'assigned' || a.status === 'in_progress')) {
      return Response.json(
        { success: false, error: 'Shipment is already assigned to another driver' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    // Create Assignment
    await db.assignments.create({
      id: generateId('asg'),
      shipmentId,
      driverId: payload.userId,
      status: 'assigned',
      assignedAt: now,
    });

    const pickupOtp = generateOTP();

    // Update shipment status
    const updatedShipment = await db.shipments.update(shipmentId, {
      status: 'accepted',
      pickupOtp,
      updatedAt: now,
    });

    // Update driver status
    await db.driverProfiles.update(payload.userId, { status: 'busy' });

    // Record status history
    await db.statusHistory.create({
      id: generateId('sth'),
      shipmentId,
      fromStatus: 'pending',
      toStatus: 'accepted',
      changedBy: payload.userId,
      changedAt: now,
    });

    // Fire webhook
    if (updatedShipment) {
      const user = await db.users.findById(payload.userId);
      const profile = await db.driverProfiles.findByUserId(payload.userId);
      fireShipmentStatusWebhook(updatedShipment, 'shipment.accepted', {
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
        status: 'accepted',
        message: 'Shipment accepted successfully. All drops are now assigned to you.',
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
