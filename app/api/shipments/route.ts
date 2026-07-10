// ============================================================
// GET /api/shipments
// ============================================================
// Returns shipments for the authenticated driver, organized into:
//   - available: pending shipments grouped by business pickup
//   - active: shipments assigned to this driver
//   - completed: completed shipments by this driver
// ============================================================

import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import type { GroupedShipment, Shipment } from '@/lib/types';

// Group pending shipments by business (pickup location)
function groupShipmentsByBusiness(shipments: Shipment[]): GroupedShipment[] {
  const groups = new Map<string, GroupedShipment>();

  for (const shipment of shipments) {
    const key = shipment.businessId;
    const existing = groups.get(key);

    if (existing) {
      existing.shipments.push(shipment);
      existing.totalDrops += shipment.drops.length;
    } else {
      groups.set(key, {
        businessName: shipment.pickup.businessName,
        businessId: shipment.businessId,
        pickupAddress: shipment.pickup.fullAddress,
        mapLink: shipment.pickup.mapLink,
        ownerName: shipment.pickup.ownerName,
        pincode: shipment.pickup.pincode,
        shipments: [shipment],
        totalDrops: shipment.drops.length,
      });
    }
  }

  return Array.from(groups.values());
}

export async function GET(request: Request) {
  try {
    const payload = await getUserFromRequest(request);
    if (!payload || payload.role !== 'driver') {
      return Response.json(
        { success: false, error: 'Unauthorized. Driver access only.' },
        { status: 401 }
      );
    }

    // Available shipments: all pending, not assigned to anyone
    // A shipment is assigned if there is an active Assignment for it.
    const allPending = db.shipments.findMany((s) => s.status === 'pending');
    const availableShipments = allPending.filter((s) => {
      const assignments = db.assignments.findByShipmentId(s.id);
      return !assignments.some(
        (a) => a.status === 'assigned' || a.status === 'in_progress'
      );
    });

    // Assignments for this driver
    const driverAssignments = db.assignments.findByDriverId(payload.userId);
    const activeAssignments = driverAssignments.filter(
      (a) => a.status === 'assigned' || a.status === 'in_progress'
    );
    const completedAssignments = driverAssignments.filter(
      (a) => a.status === 'completed'
    );

    // Active shipments
    const activeShipments = activeAssignments
      .map((a) => db.shipments.findById(a.shipmentId))
      .filter((s): s is Shipment => s !== undefined && ['accepted', 'picked_up', 'out_for_delivery'].includes(s.status));

    // Completed shipments
    const completedShipments = completedAssignments
      .map((a) => db.shipments.findById(a.shipmentId))
      .filter((s): s is Shipment => s !== undefined && s.status === 'completed');

    return Response.json({
      success: true,
      data: {
        available: groupShipmentsByBusiness(availableShipments),
        active: activeShipments.map((s) => ({
          id: s.id,
          trackingNumber: s.trackingNumber,
          status: s.status,
          pickup: s.pickup,
          drops: s.drops,
          businessId: s.businessId,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        })),
        completed: completedShipments
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          .slice(0, 20)
          .map((s) => ({
            id: s.id,
            trackingNumber: s.trackingNumber,
            pickup: {
              businessName: s.pickup.businessName,
              fullAddress: s.pickup.fullAddress,
            },
            dropsCount: s.drops.length,
            completedAt: s.updatedAt,
          })),
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
