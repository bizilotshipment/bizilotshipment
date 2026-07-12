// ============================================================
// GET /api/v1/shipments/[shipmentId]/status
// ============================================================
// Lightweight status check — returns just status + timestamps.
// Ideal for polling.
// ============================================================

import { db } from '@/lib/db';
import { getApiKeyFromRequest, hashApiKey } from '@/lib/auth';

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

    // Get driver info if assigned
    let driver = null;
    const assignments = await db.assignments.findByShipmentId(shipment.id);
    const activeAssignment = assignments.find(
      (a) => a.status === 'assigned' || a.status === 'in_progress'
    );
    if (activeAssignment) {
      const user = await db.users.findById(activeAssignment.driverId);
      const profile = await db.driverProfiles.findByUserId(activeAssignment.driverId);
      if (user && profile) {
        driver = {
          name: user.fullName,
          vehicleNumber: profile.vehicleNumber,
        };
      }
    }

    return Response.json({
      success: true,
      data: {
        shipmentId: shipment.id,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        driver,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt,
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
