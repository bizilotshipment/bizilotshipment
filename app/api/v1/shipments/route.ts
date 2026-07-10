// ============================================================
// /api/v1/shipments
// ============================================================
// POST: Create a new shipment
// GET: List shipments for the authenticated API client
// ============================================================

import { db } from '@/lib/db';
import { getApiKeyFromRequest, generateId, hashApiKey, generateTrackingNumber, getUserFromRequest } from '@/lib/auth';
import { CreateJobSchema, JobListQuerySchema } from '@/lib/validators';
import { fireShipmentStatusWebhook } from '@/lib/webhooks';
import type { NextRequest } from 'next/server';

// --- Authenticate Account (Dual Auth) ---
async function authenticateAccount(request: Request) {
  // 1. Try API Key
  const apiKey = getApiKeyFromRequest(request);
  if (apiKey) {
    const hashed = hashApiKey(apiKey);
    const client = db.apiClients.findByApiKey(hashed);
    if (!client) return { error: 'Invalid API key', status: 401 };
    if (client.status !== 'active') return { error: 'API client is suspended', status: 403 };
    
    const account = db.accounts.findById(client.accountId);
    if (!account) return { error: 'Account not found for this client', status: 404 };
    
    return { account, apiClientId: client.id };
  }

  // 2. Try JWT Cookie (Manual UI Client)
  const user = await getUserFromRequest(request);
  if (user) {
    const accounts = db.accounts.findByUserId(user.userId);
    if (accounts.length === 0) return { error: 'No account associated with this user', status: 404 };
    
    // For manual console users, apiClientId is explicitly null
    return { account: accounts[0], apiClientId: null };
  }

  return { error: 'Unauthorized. Missing API Key or Session.', status: 401 };
}

// --- POST: Create shipment ---

export async function POST(request: Request) {
  try {
    const authResult = await authenticateAccount(request);
    if (authResult.error || !authResult.account) {
      return Response.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }
    const { account, apiClientId } = authResult;

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

    const { accountId, pickup, drops } = parsed.data;

    // Resolve account (If the payload specifies an account ID, verify it belongs to this authenticated account context)
    let resolvedAccountId = accountId;
    if (!resolvedAccountId) {
      resolvedAccountId = account.id;
    } else {
      if (account.id !== resolvedAccountId) {
        return Response.json(
          { success: false, error: 'Account not found or does not belong to this token' },
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
      accountId: resolvedAccountId,
      apiClientId: apiClientId, // Can be null if manual UI user
      status: 'pending',
      pickup: {
        id: generateId('pck'),
        shipmentId,
        businessName: pickup.businessName,
        ownerName: pickup.ownerName,
        contactNumber: pickup.contactNumber,
        fullAddress: pickup.fullAddress,
        mapLink: pickup.mapLink,
        pincode: pickup.pincode,
      },
      drops: drops.map((drop, index) => ({
        id: generateId('drp'),
        shipmentId,
        customerName: drop.customerName,
        contactNumber: drop.contactNumber,
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
          accountId: shipment.accountId,
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
    const authResult = await authenticateAccount(request);
    if (authResult.error || !authResult.account) {
      return Response.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }
    const { account } = authResult;

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

    // Filter shipments belonging to this account
    let shipments = db.shipments.findMany(
      (s) => s.accountId === account.id
    );

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
          accountId: s.accountId,
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
