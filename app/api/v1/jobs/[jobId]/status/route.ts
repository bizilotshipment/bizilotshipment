// ============================================================
// GET /api/v1/jobs/[jobId]/status
// ============================================================
// Lightweight status check — returns just status + timestamps.
// Ideal for polling.
// ============================================================

import { db } from '@/lib/db';
import { getApiKeyFromRequest } from '@/lib/auth';

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

    // Get driver info if assigned
    let driver = null;
    if (job.assignedDriverId) {
      const user = db.users.findById(job.assignedDriverId);
      const profile = db.driverProfiles.findByUserId(job.assignedDriverId);
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
        jobId: job.id,
        status: job.status,
        driver,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
