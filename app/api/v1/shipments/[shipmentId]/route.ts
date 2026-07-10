// ============================================================
// GET /api/v1/shipments/[shipmentId]
// ============================================================
// Returns full shipment details including driver info (non-sensitive).
// ============================================================

import { db } from '@/lib/db';
import { getApiKeyFromRequest, hashApiKey } from '@/lib/auth';
import type { PublicDriverInfo } from '@/lib/types';

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
    const client = db.apiClients.findByApiKey(hashedApiKey);
    if (!client) {
      return Response.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Find shipment
    const shipment = db.shipments.findById(shipmentId);
    if (!shipment || shipment.apiClientId !== client.id) {
      return Response.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Get driver info from Assignment
    let driver: PublicDriverInfo | null = null;
    const assignments = db.assignments.findByShipmentId(shipment.id);
    const activeAssignment = assignments.find(
      (a) => a.status === 'assigned' || a.status === 'in_progress'
    );

    if (activeAssignment) {
      const user = db.users.findById(activeAssignment.driverId);
      const profile = db.driverProfiles.findByUserId(activeAssignment.driverId);
      if (user && profile) {
        driver = {
          id: user.id,
          name: user.fullName,
          vehicleNumber: profile.vehicleNumber,
          status: profile.status,
        };
      }
    }

    // Get status history
    const history = db.statusHistory.findByShipmentId(shipmentId);

    return Response.json({
      success: true,
      data: {
        shipment: {
          id: shipment.id,
          trackingNumber: shipment.trackingNumber,
          status: shipment.status,
          businessId: shipment.businessId,
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
