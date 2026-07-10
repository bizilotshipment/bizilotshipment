// ============================================================
// /api/v1/jobs
// ============================================================
// POST: Create a new delivery job
// GET: List jobs for the authenticated API client
// ============================================================

import { db } from '@/lib/db';
import { getApiKeyFromRequest, generateId } from '@/lib/auth';
import { CreateJobSchema, JobListQuerySchema } from '@/lib/validators';
import { fireJobStatusWebhook } from '@/lib/webhooks';
import type { NextRequest } from 'next/server';

// --- Authenticate API client ---
function authenticateClient(request: Request) {
  const apiKey = getApiKeyFromRequest(request);
  if (!apiKey) return null;
  return db.apiClients.findByApiKey(apiKey);
}

// --- POST: Create delivery job ---

export async function POST(request: Request) {
  try {
    const client = authenticateClient(request);
    if (!client) {
      return Response.json(
        { success: false, error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    if (client.status !== 'active') {
      return Response.json(
        { success: false, error: 'API client is suspended' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const parsed = CreateJobSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { businessId, pickup, drops } = parsed.data;

    // Resolve business
    let resolvedBusinessId = businessId;
    if (!resolvedBusinessId) {
      // Use the client's default business
      const businesses = db.businesses.findByApiClientId(client.id);
      if (businesses.length === 0) {
        return Response.json(
          { success: false, error: 'No business found for this client. Contact support.' },
          { status: 400 }
        );
      }
      resolvedBusinessId = businesses[0].id;
    } else {
      // Verify business belongs to this client
      const business = db.businesses.findById(resolvedBusinessId);
      if (!business || business.apiClientId !== client.id) {
        return Response.json(
          { success: false, error: 'Business not found or does not belong to this client' },
          { status: 404 }
        );
      }
    }

    // Create the delivery job
    const jobId = generateId('job');
    const now = new Date().toISOString();

    const job = db.deliveryJobs.create({
      id: jobId,
      businessId: resolvedBusinessId,
      apiClientId: client.id,
      status: 'pending',
      assignedDriverId: null,
      pickup: {
        id: generateId('pck'),
        jobId,
        businessName: pickup.businessName,
        ownerName: pickup.ownerName,
        fullAddress: pickup.fullAddress,
        mapLink: pickup.mapLink,
        pincode: pickup.pincode,
      },
      drops: drops.map((drop, index) => ({
        id: generateId('drp'),
        jobId,
        customerName: drop.customerName,
        completeAddress: drop.completeAddress,
        googleMapsLink: drop.googleMapsLink,
        pincode: drop.pincode,
        sequenceNumber: index + 1,
      })),
      createdAt: now,
      updatedAt: now,
    });

    // Record status history
    db.statusHistory.create({
      id: generateId('sth'),
      jobId,
      fromStatus: null,
      toStatus: 'pending',
      changedBy: 'system',
      changedAt: now,
    });

    // Fire webhook
    fireJobStatusWebhook(job, 'job.created');

    return Response.json(
      {
        success: true,
        data: {
          jobId: job.id,
          status: job.status,
          businessId: job.businessId,
          dropsCount: job.drops.length,
          createdAt: job.createdAt,
        },
      },
      { status: 201 }
    );
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// --- GET: List jobs ---

export async function GET(request: NextRequest) {
  try {
    const client = authenticateClient(request);
    if (!client) {
      return Response.json(
        { success: false, error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const query = JobListQuerySchema.safeParse({
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    if (!query.success) {
      return Response.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { status, page, limit } = query.data;

    // Fetch jobs for this client
    let jobs = db.deliveryJobs.findMany(
      (j) => j.apiClientId === client.id
    );

    // Filter by status if provided
    if (status) {
      jobs = jobs.filter((j) => j.status === status);
    }

    // Sort by createdAt desc
    jobs.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Paginate
    const total = jobs.length;
    const start = (page - 1) * limit;
    const paginatedJobs = jobs.slice(start, start + limit);

    return Response.json({
      success: true,
      data: {
        jobs: paginatedJobs.map((j) => ({
          id: j.id,
          status: j.status,
          businessId: j.businessId,
          pickup: {
            businessName: j.pickup.businessName,
            ownerName: j.pickup.ownerName,
            fullAddress: j.pickup.fullAddress,
            pincode: j.pickup.pincode,
          },
          dropsCount: j.drops.length,
          assignedDriverId: j.assignedDriverId,
          createdAt: j.createdAt,
          updatedAt: j.updatedAt,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
