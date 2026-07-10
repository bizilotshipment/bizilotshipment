// ============================================================
// GET /api/v1/jobs/[jobId]
// ============================================================
// Returns full job details including driver info (non-sensitive).
// ============================================================

import { db } from '@/lib/db';
import { getApiKeyFromRequest } from '@/lib/auth';
import type { PublicDriverInfo } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    // Authenticate
    const apiKey = getApiKeyFromRequest(request);
    if (!apiKey) {
      return Response.json(
        { success: false, error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    const client = db.apiClients.findByApiKey(apiKey);
    if (!client) {
      return Response.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Find job
    const job = db.deliveryJobs.findById(jobId);
    if (!job || job.apiClientId !== client.id) {
      return Response.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get driver info (non-sensitive only)
    let driver: PublicDriverInfo | null = null;
    if (job.assignedDriverId) {
      const user = db.users.findById(job.assignedDriverId);
      const profile = db.driverProfiles.findByUserId(job.assignedDriverId);
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
    const history = db.statusHistory.findByJobId(jobId);

    return Response.json({
      success: true,
      data: {
        job: {
          id: job.id,
          status: job.status,
          businessId: job.businessId,
          pickup: job.pickup,
          drops: job.drops,
          driver,
          statusHistory: history.map((h) => ({
            from: h.fromStatus,
            to: h.toStatus,
            changedBy: h.changedBy,
            changedAt: h.changedAt,
          })),
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
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
