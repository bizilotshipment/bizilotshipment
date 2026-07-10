// ============================================================
// POST /api/jobs/[jobId]/complete
// ============================================================
// Driver marks job as completed — all drops delivered.
// ============================================================

import { db } from '@/lib/db';
import { getUserFromRequest, generateId } from '@/lib/auth';
import { fireJobStatusWebhook } from '@/lib/webhooks';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const payload = await getUserFromRequest(request);
    if (!payload || payload.role !== 'driver') {
      return Response.json(
        { success: false, error: 'Unauthorized. Driver access only.' },
        { status: 401 }
      );
    }

    // Find job
    const job = db.deliveryJobs.findById(jobId);
    if (!job) {
      return Response.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.assignedDriverId !== payload.userId) {
      return Response.json(
        { success: false, error: 'This job is not assigned to you' },
        { status: 403 }
      );
    }

    if (!['picked_up', 'out_for_delivery'].includes(job.status)) {
      return Response.json(
        { success: false, error: `Cannot complete job. Current status: ${job.status}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Update job
    const updatedJob = db.deliveryJobs.update(jobId, {
      status: 'completed',
      updatedAt: now,
    });

    // Update driver status back to available
    db.driverProfiles.update(payload.userId, { status: 'available' });

    // Record status history
    db.statusHistory.create({
      id: generateId('sth'),
      jobId,
      fromStatus: job.status,
      toStatus: 'completed',
      changedBy: payload.userId,
      changedAt: now,
    });

    // Fire webhook
    if (updatedJob) {
      const user = db.users.findById(payload.userId);
      const profile = db.driverProfiles.findByUserId(payload.userId);
      fireJobStatusWebhook(updatedJob, 'job.completed', {
        id: payload.userId,
        name: user?.fullName || '',
        vehicleNumber: profile?.vehicleNumber || '',
        status: 'available',
      });
    }

    return Response.json({
      success: true,
      data: {
        jobId,
        status: 'completed',
        message: 'Job completed successfully. You are now available for new jobs.',
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
