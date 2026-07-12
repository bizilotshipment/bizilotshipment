// ============================================================
// GET /api/v1/shipments/[shipmentId]
// ============================================================
// Returns full shipment details including driver info (non-sensitive).
// ============================================================

import { db } from '@/lib/db';
import { getApiKeyFromRequest, hashApiKey, generateId, generateOTP } from '@/lib/auth';
import type { PublicDriverInfo } from '@/lib/types';
import { UpdateJobSchema } from '@/lib/validators';
import { fireShipmentStatusWebhook } from '@/lib/webhooks';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;

    // Authenticate
    const apiKey = getApiKeyFromRequest(request);
    if (!apiKey) {
      return Response.json(
        { success: false, error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    const hashedApiKey = hashApiKey(apiKey);
    const client = await db.apiClients.findByApiKey(hashedApiKey);
    if (!client) {
      return Response.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Find shipment
    const shipment = await db.shipments.findById(shipmentId);
    if (!shipment || shipment.apiClientId !== client.id) {
      return Response.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Get driver info from Assignment
    let driver: PublicDriverInfo | null = null;
    const assignments = await db.assignments.findByShipmentId(shipment.id);
    const activeAssignment = assignments.find(
      (a) => a.status === 'assigned' || a.status === 'in_progress'
    );

    if (activeAssignment) {
      const user = await db.users.findById(activeAssignment.driverId);
      const profile = await db.driverProfiles.findByUserId(activeAssignment.driverId);
      if (user && profile) {
        driver = {
          id: user.id,
          name: user.fullName,
          vehicleNumber: profile.vehicleNumber,
          status: profile.status as any,
        };
      }
    }

    // Get status history
    const history = await db.statusHistory.findByShipmentId(shipmentId);

    return Response.json({
      success: true,
      data: {
        shipment: {
          id: shipment.id,
          trackingNumber: shipment.trackingNumber,
          status: shipment.status,
          accountId: shipment.accountId,
          pickup: shipment.pickup,
          drops: shipment.drops,
          driver,
          statusHistory: history.map((h) => ({
            from: h.fromStatus,
            to: h.toStatus,
            changedBy: h.changedBy,
            changedAt: h.changedAt,
          })),
          createdAt: shipment.createdAt,
          updatedAt: shipment.updatedAt,
        },
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT /api/v1/shipments/[shipmentId]
// ============================================================
// Update an existing shipment (only allowed if pending or accepted).
// ============================================================
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;

    const apiKey = getApiKeyFromRequest(request);
    if (!apiKey) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const hashedApiKey = hashApiKey(apiKey);
    const client = await db.apiClients.findByApiKey(hashedApiKey);
    if (!client) return Response.json({ success: false, error: 'Invalid API key' }, { status: 401 });

    const shipment = await db.shipments.findById(shipmentId);
    if (!shipment || shipment.apiClientId !== client.id) {
      return Response.json({ success: false, error: 'Shipment not found' }, { status: 404 });
    }

    if (shipment.status !== 'pending' && shipment.status !== 'accepted') {
      return Response.json(
        { success: false, error: 'Shipment cannot be edited after pickup.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = UpdateJobSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { success: false, error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { pickup, drops } = result.data;
    
    // Process drops: preserve existing, generate for new
    const updatedDrops = drops.map((dropInput, index) => {
      if (dropInput.id) {
        const existingDrop = shipment.drops.find((d: any) => d.id === dropInput.id);
        if (existingDrop) {
          return {
            ...existingDrop,
            customerName: dropInput.customerName,
            contactNumber: dropInput.contactNumber,
            completeAddress: dropInput.completeAddress,
            googleMapsLink: dropInput.googleMapsLink,
            pincode: dropInput.pincode,
            sequenceNumber: index + 1,
          };
        }
      }
      // New drop or id didn't match anything
      return {
        id: generateId('drp'),
        shipmentId,
        customerName: dropInput.customerName,
        contactNumber: dropInput.contactNumber,
        completeAddress: dropInput.completeAddress,
        googleMapsLink: dropInput.googleMapsLink,
        pincode: dropInput.pincode,
        sequenceNumber: index + 1,
        status: 'pending',
        dropOtp: generateOTP(),
      };
    });

    const now = new Date().toISOString();

    const updatedShipment = await db.shipments.update(shipmentId, {
      pickup: {
        id: shipment.pickup.id,
        shipmentId,
        ...pickup,
      },
      drops: updatedDrops,
      updatedAt: now,
    } as any);

    return Response.json({
      success: true,
      data: {
        shipmentId: updatedShipment.id,
        status: updatedShipment.status,
        dropsCount: updatedShipment.drops.length,
        updatedAt: updatedShipment.updatedAt,
      },
    });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================
// DELETE /api/v1/shipments/[shipmentId]
// ============================================================
// Hard delete a shipment (only allowed if pending or accepted).
// ============================================================
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  try {
    const { shipmentId } = await params;

    const apiKey = getApiKeyFromRequest(request);
    if (!apiKey) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const hashedApiKey = hashApiKey(apiKey);
    const client = await db.apiClients.findByApiKey(hashedApiKey);
    if (!client) return Response.json({ success: false, error: 'Invalid API key' }, { status: 401 });

    const shipment = await db.shipments.findById(shipmentId);
    if (!shipment || shipment.apiClientId !== client.id) {
      return Response.json({ success: false, error: 'Shipment not found' }, { status: 404 });
    }

    if (shipment.status !== 'pending' && shipment.status !== 'accepted') {
      return Response.json(
        { success: false, error: 'Shipment cannot be deleted after pickup.' },
        { status: 400 }
      );
    }

    // Free up driver if assigned
    const assignments = await db.assignments.findByShipmentId(shipmentId);
    for (const a of assignments) {
      if (a.status === 'assigned' || a.status === 'in_progress') {
        await db.driverProfiles.update(a.driverId, { status: 'available' });
      }
    }

    // Delete associated records (hard delete)
    await db.assignments.deleteMany({ shipmentId });
    await db.statusHistory.deleteMany({ shipmentId });
    await db.webhookLogs.deleteMany({ shipmentId });
    
    // Delete shipment
    await db.shipments.delete(shipmentId);

    return Response.json({
      success: true,
      data: {
        message: 'Shipment deleted successfully.',
      },
    });
  } catch {
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
