// ============================================================
// GET /api/shipments
// ============================================================
// Returns shipments for the authenticated driver, organized into:
//   - available: pending shipments grouped by pickup account
//   - active: shipments assigned to this driver
//   - completed: completed shipments by this driver
// ============================================================

import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import type { GroupedShipment, Shipment } from '@/lib/types';

// Group pending shipments by account (pickup location)
function groupShipmentsByAccount(shipments: Shipment[]): GroupedShipment[] {
  const groups = new Map<string, GroupedShipment>();

  for (const shipment of shipments) {
    const key = shipment.accountId;
    const existing = groups.get(key);

    if (existing) {
      existing.shipments.push(shipment);
      existing.totalDrops += shipment.drops.length;
    } else {
      groups.set(key, {
        businessName: shipment.pickup.businessName,
        accountId: shipment.accountId,
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
    const allPending = await db.shipments.findMany({ status: 'pending' });
    
    // Filter available shipments asynchronously
    const availableShipments = [];
    for (const s of allPending) {
      const assignments = await db.assignments.findByShipmentId(s.id);
      if (!assignments.some((a) => a.status === 'assigned' || a.status === 'in_progress')) {
        availableShipments.push(s);
      }
    }

    // Assignments for this driver
    const driverAssignments = await db.assignments.findByDriverId(payload.userId);
    const activeAssignments = driverAssignments.filter(
      (a) => a.status === 'assigned' || a.status === 'in_progress'
    );
    const completedAssignments = driverAssignments.filter(
      (a) => a.status === 'completed'
    );

    // Active shipments
    const activeShipmentsRaw = await Promise.all(
      activeAssignments.map(async (a) => await db.shipments.findById(a.shipmentId))
    );
    const activeShipments = activeShipmentsRaw.filter(
      (s): s is Shipment => s !== null && ['accepted', 'picked_up', 'out_for_delivery'].includes(s.status)
    );

    // Completed shipments
    const completedShipmentsRaw = await Promise.all(
      completedAssignments.map(async (a) => await db.shipments.findById(a.shipmentId))
    );
    const completedShipments = completedShipmentsRaw.filter(
      (s): s is Shipment => s !== null && s.status === 'completed'
    );

    return Response.json({
      success: true,
      data: {
        available: groupShipmentsByAccount(availableShipments),
        active: activeShipments.map((s) => ({
          id: s.id,
          trackingNumber: s.trackingNumber,
          status: s.status,
          pickup: s.pickup,
          drops: s.drops,
          accountId: s.accountId,
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
