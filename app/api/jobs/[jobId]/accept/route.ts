// ============================================================
// POST /api/jobs/[jobId]/accept
// ============================================================
// Driver accepts a delivery job (entire pickup with all drops).
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

    if (job.status !== 'pending') {
      return Response.json(
        { success: false, error: `Job cannot be accepted. Current status: ${job.status}` },
        { status: 400 }
      );
    }

    if (job.assignedDriverId) {
      return Response.json(
        { success: false, error: 'Job is already assigned to another driver' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    // Update job
    const updatedJob = db.deliveryJobs.update(jobId, {
      status: 'accepted',
      assignedDriverId: payload.userId,
      updatedAt: now,
    });

    // Update driver status
    db.driverProfiles.update(payload.userId, { status: 'busy' });

    // Record status history
    db.statusHistory.create({
      id: generateId('sth'),
      jobId,
      fromStatus: 'pending',
      toStatus: 'accepted',
      changedBy: payload.userId,
      changedAt: now,
    });

    // Fire webhook
    if (updatedJob) {
      const user = db.users.findById(payload.userId);
      const profile = db.driverProfiles.findByUserId(payload.userId);
      fireJobStatusWebhook(updatedJob, 'job.accepted', {
        id: payload.userId,
        name: user?.fullName || '',
        vehicleNumber: profile?.vehicleNumber || '',
        status: 'busy',
      });
    }

    return Response.json({
      success: true,
      data: {
        jobId,
        status: 'accepted',
        message: 'Job accepted successfully. All drops are now assigned to you.',
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
