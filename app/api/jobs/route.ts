// ============================================================
// GET /api/jobs
// ============================================================
// Returns jobs for the authenticated driver, organized into:
//   - available: pending jobs grouped by business pickup
//   - accepted: jobs assigned to this driver
//   - completed: completed jobs by this driver
// ============================================================

import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import type { GroupedJob, DeliveryJob } from '@/lib/types';

// Group pending jobs by business (pickup location)
function groupJobsByBusiness(jobs: DeliveryJob[]): GroupedJob[] {
  const groups = new Map<string, GroupedJob>();

  for (const job of jobs) {
    const key = job.businessId;
    const existing = groups.get(key);

    if (existing) {
      existing.jobs.push(job);
      existing.totalDrops += job.drops.length;
    } else {
      groups.set(key, {
        businessName: job.pickup.businessName,
        businessId: job.businessId,
        pickupAddress: job.pickup.fullAddress,
        mapLink: job.pickup.mapLink,
        ownerName: job.pickup.ownerName,
        pincode: job.pickup.pincode,
        jobs: [job],
        totalDrops: job.drops.length,
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

    // Available jobs: all pending, not assigned to anyone
    const availableJobs = db.deliveryJobs.findMany(
      (j) => j.status === 'pending' && !j.assignedDriverId
    );

    // Accepted/in-progress: assigned to this driver, not completed
    const activeJobs = db.deliveryJobs.findMany(
      (j) =>
        j.assignedDriverId === payload.userId &&
        ['accepted', 'picked_up', 'out_for_delivery'].includes(j.status)
    );

    // Completed: assigned to this driver, completed
    const completedJobs = db.deliveryJobs.findMany(
      (j) =>
        j.assignedDriverId === payload.userId && j.status === 'completed'
    );

    return Response.json({
      success: true,
      data: {
        available: groupJobsByBusiness(availableJobs),
        active: activeJobs.map((j) => ({
          id: j.id,
          status: j.status,
          pickup: j.pickup,
          drops: j.drops,
          businessId: j.businessId,
          createdAt: j.createdAt,
          updatedAt: j.updatedAt,
        })),
        completed: completedJobs
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() -
              new Date(a.updatedAt).getTime()
          )
          .slice(0, 20)
          .map((j) => ({
            id: j.id,
            pickup: {
              businessName: j.pickup.businessName,
              fullAddress: j.pickup.fullAddress,
            },
            dropsCount: j.drops.length,
            completedAt: j.updatedAt,
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
