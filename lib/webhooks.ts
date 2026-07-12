// ============================================================
// Delivery Platform — Webhook Engine
// ============================================================
// Fires webhooks to API clients when shipment status changes.
// Logs all attempts. Retry with exponential backoff.
// ============================================================

import { db } from './db';
import { generateId } from './auth';
import type { WebhookEvent, Shipment, PublicDriverInfo } from './types';

interface WebhookPayload {
  event: WebhookEvent;
  shipmentId: string;
  trackingNumber: string;
  status: string;
  timestamp: string;
  data: {
    shipment: {
      id: string;
      trackingNumber: string;
      status: string;
      accountId: string;
      dropsCount: number;
    };
    driver?: PublicDriverInfo;
  };
}

export async function fireWebhook(
  apiClientId: string,
  event: WebhookEvent,
  shipment: Shipment,
  driver?: PublicDriverInfo
): Promise<void> {
  const client = await db.apiClients.findById(apiClientId);
  if (!client || !client.webhookUrl) return;

  // Check if client is subscribed to this event
  if (client.webhookEvents.length > 0 && !client.webhookEvents.includes(event)) {
    return;
  }

  const payload: WebhookPayload = {
    event,
    shipmentId: shipment.id,
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    timestamp: new Date().toISOString(),
    data: {
      shipment: {
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        accountId: shipment.accountId,
        dropsCount: shipment.drops.length,
      },
      driver,
    },
  };

  const payloadStr = JSON.stringify(payload);

  // Fire webhook with retry (3 attempts, exponential backoff)
  let statusCode: number | null = null;
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(client.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Delivery': generateId('whd'),
        },
        body: payloadStr,
        signal: AbortSignal.timeout(10000), // 10s timeout
      });
      statusCode = response.status;

      if (response.ok) break; // Success, no retry needed
    } catch {
      statusCode = null; // Request failed
    }

    // Exponential backoff: 1s, 2s, 4s
    if (attempt < maxRetries - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt))
      );
    }
  }

  // Log the webhook attempt
  await db.webhookLogs.create({
    id: generateId('whl'),
    apiClientId,
    shipmentId: shipment.id,
    event,
    payload: payloadStr,
    statusCode,
    sentAt: new Date().toISOString(),
  });
}

// --- Fire webhook for a status change ---

export async function fireShipmentStatusWebhook(
  shipment: Shipment,
  event: WebhookEvent,
  driver?: PublicDriverInfo
): Promise<void> {
  if (!shipment.apiClientId) return;
  await fireWebhook(shipment.apiClientId, event, shipment, driver);
}
