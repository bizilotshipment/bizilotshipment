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
    
    const body = await request.json().catch(() => ({}));
    const { dropIndex, otp, failureReasons } = body;

    if (dropIndex === undefined || !otp || !failureReasons || failureReasons.length === 0) {
      return Response.json(
        { success: false, error: 'Missing required drop completion data (dropIndex, otp, failureReasons)' },
        { status: 400 }
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

    // Usually drivers might transition from 'out_for_delivery' or 'picked_up'
    if (shipment.status !== 'picked_up' && shipment.status !== 'out_for_delivery') {
      return Response.json(
        { success: false, error: `Cannot complete shipment. Current status: ${shipment.status}` },
        { status: 400 }
      );
    }

    // Verify assignment
    const assignments = await db.assignments.findByShipmentId(shipmentId);
    const driverAssignment = assignments.find(
      (a) => a.driverId === payload.userId && a.status === 'in_progress'
    );

    if (!driverAssignment) {
      return Response.json(
        { success: false, error: 'Not authorized for this shipment or shipment not in progress' },
        { status: 403 }
      );
    }

    const targetDrop = shipment.drops[dropIndex];
    if (!targetDrop) {
      return Response.json({ success: false, error: 'Drop not found' }, { status: 404 });
    }

    if (targetDrop.status !== 'pending') {
      return Response.json({ success: false, error: 'Drop already completed' }, { status: 400 });
    }

    if (targetDrop.dropOtp && targetDrop.dropOtp !== otp) {
      return Response.json({ success: false, error: 'Invalid Drop OTP' }, { status: 400 });
    }

    const now = new Date().toISOString();

    const isSuccessful = failureReasons.includes('Successful') && failureReasons.length === 1;
    
    const updatedDrops = [...shipment.drops];
    updatedDrops[dropIndex] = {
      ...targetDrop,
      status: isSuccessful ? 'delivered' : 'failed',
      failureReasons,
    };

    const allCompleted = updatedDrops.every(d => d.status !== 'pending');

    // Update shipment
    const updatedShipment = await db.shipments.update(shipmentId, {
      status: allCompleted ? 'completed' : 'out_for_delivery',
      drops: updatedDrops,
      updatedAt: now,
    });

    if (allCompleted) {
      await db.assignments.update(driverAssignment.id, {
        status: 'completed',
      });
      await db.driverProfiles.update(payload.userId, { status: 'available' });

      await db.statusHistory.create({
        id: generateId('sth'),
        shipmentId,
        fromStatus: shipment.status,
        toStatus: 'completed',
        changedBy: payload.userId,
        changedAt: now,
      });

      if (updatedShipment) {
        const user = await db.users.findById(payload.userId);
        const profile = await db.driverProfiles.findByUserId(payload.userId);
        fireShipmentStatusWebhook(updatedShipment, 'shipment.completed', {
          id: payload.userId,
          name: user?.fullName || '',
          vehicleNumber: profile?.vehicleNumber || '',
          status: 'available',
        });
      }
    }

    return Response.json({
      success: true,
      data: {
        shipmentId,
        status: allCompleted ? 'completed' : 'out_for_delivery',
        message: allCompleted ? 'Shipment fully completed.' : 'Drop completed successfully.',
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
