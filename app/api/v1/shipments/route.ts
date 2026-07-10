// ============================================================
// /api/v1/shipments
// ============================================================
// POST: Create a new shipment
// GET: List shipments for the authenticated API client
// ============================================================

import { db } from '@/lib/db';
import { getApiKeyFromRequest, generateId, hashApiKey, generateTrackingNumber } from '@/lib/auth';
import { CreateJobSchema, JobListQuerySchema } from '@/lib/validators';
import { fireShipmentStatusWebhook } from '@/lib/webhooks';
import type { NextRequest } from 'next/server';

// --- Authenticate API client ---
function authenticateClient(request: Request) {
  const apiKey = getApiKeyFromRequest(request);
  if (!apiKey) return null;
  const hashed = hashApiKey(apiKey);
  return db.apiClients.findByApiKey(hashed);
}

// --- POST: Create shipment ---

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

    // Validate input (we can reuse CreateJobSchema or rename it later, assuming it still accepts pickup/drops)
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
      const businesses = db.businesses.findByApiClientId(client.id);
      if (businesses.length === 0) {
        return Response.json(
          { success: false, error: 'No business found for this client. Contact support.' },
          { status: 400 }
        );
      }
      resolvedBusinessId = businesses[0].id;
    } else {
      const business = db.businesses.findById(resolvedBusinessId);
      if (!business || business.apiClientId !== client.id) {
        return Response.json(
          { success: false, error: 'Business not found or does not belong to this client' },
          { status: 404 }
        );
      }
    }

    // Create the shipment
    const shipmentId = generateId('shp');
    const trackingNumber = generateTrackingNumber();
    const now = new Date().toISOString();

    const shipment = db.shipments.create({
      id: shipmentId,
      trackingNumber,
      businessId: resolvedBusinessId,
      apiClientId: client.id,
      status: 'pending',
      pickup: {
        id: generateId('pck'),
        shipmentId,
        businessName: pickup.businessName,
        ownerName: pickup.ownerName,
        fullAddress: pickup.fullAddress,
        mapLink: pickup.mapLink,
        pincode: pickup.pincode,
      },
      drops: drops.map((drop, index) => ({
        id: generateId('drp'),
        shipmentId,
        customerName: drop.customerName,
        completeAddress: drop.completeAddress,
        googleMapsLink: drop.googleMapsLink,
        pincode: drop.pincode,
        sequenceNumber: index + 1,
        status: 'pending',
      })),
      createdAt: now,
      updatedAt: now,
    });

    // Record status history
    db.statusHistory.create({
      id: generateId('sth'),
      shipmentId,
      fromStatus: null,
      toStatus: 'pending',
      changedBy: 'system',
      changedAt: now,
    });

    // Fire webhook
    fireShipmentStatusWebhook(shipment, 'shipment.created');

    return Response.json(
      {
        success: true,
        data: {
          shipmentId: shipment.id,
          trackingNumber: shipment.trackingNumber,
          status: shipment.status,
          businessId: shipment.businessId,
          dropsCount: shipment.drops.length,
          createdAt: shipment.createdAt,
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

// --- GET: List shipments ---

export async function GET(request: NextRequest) {
  try {
    const client = authenticateClient(request);
    if (!client) {
      return Response.json(
        { success: false, error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

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

    let shipments = db.shipments.findMany((s) => s.apiClientId === client.id);

    if (status) {
      shipments = shipments.filter((s) => s.status === status);
    }

    shipments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = shipments.length;
    const start = (page - 1) * limit;
    const paginated = shipments.slice(start, start + limit);

    return Response.json({
      success: true,
      data: {
        shipments: paginated.map((s) => ({
          id: s.id,
          trackingNumber: s.trackingNumber,
          status: s.status,
          businessId: s.businessId,
          pickup: {
            businessName: s.pickup.businessName,
            ownerName: s.pickup.ownerName,
            fullAddress: s.pickup.fullAddress,
            pincode: s.pickup.pincode,
          },
          dropsCount: s.drops.length,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
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
