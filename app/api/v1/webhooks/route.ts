// ============================================================
// /api/v1/webhooks
// ============================================================
// PUT: Configure webhook URL and events
// GET: Current config and logs
// ============================================================

import { db } from '@/lib/db';
import { getApiKeyFromRequest, hashApiKey } from '@/lib/auth';
import { WebhookConfigSchema } from '@/lib/validators';

// --- PUT: Configure webhook ---

export async function PUT(request: Request) {
  try {
    // Authenticate
    const apiKey = getApiKeyFromRequest(request);
    if (!apiKey) {
      return Response.json(
        { success: false, error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    const hashedApiKey = hashApiKey(apiKey);
    const client = await db.apiClients.findByApiKey(hashedApiKey);
    if (!client) {
      return Response.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate
    const parsed = WebhookConfigSchema.safeParse(body);
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

    const { webhookUrl, events } = parsed.data;

    // Update client
    await db.apiClients.update(client.id, {
      webhookUrl,
      webhookEvents: events,
    });

    return Response.json({
      success: true,
      data: {
        webhookUrl,
        events,
        message: 'Webhook configuration updated successfully',
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// --- GET: Get current webhook config ---

export async function GET(request: Request) {
  try {
    const apiKey = getApiKeyFromRequest(request);
    if (!apiKey) {
      return Response.json(
        { success: false, error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    const hashedApiKey = hashApiKey(apiKey);
    const client = await db.apiClients.findByApiKey(hashedApiKey);
    if (!client) {
      return Response.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Get recent webhook logs
    const logs = db.webhookLogs
      .findByApiClientId(client.id)
      .sort(
        (a, b) =>
          new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      )
      .slice(0, 50);

    return Response.json({
      success: true,
      data: {
        webhookUrl: client.webhookUrl,
        events: client.webhookEvents,
        recentLogs: logs.map((l) => ({
          id: l.id,
          event: l.event,
          shipmentId: l.shipmentId,
          statusCode: l.statusCode,
          sentAt: l.sentAt,
          payload: JSON.parse(l.payload),
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
