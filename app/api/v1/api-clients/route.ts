// ============================================================
// POST /api/v1/register
// ============================================================
// Register as an API client and get an API key.
// Auto-creates a default Account for the client.
// ============================================================

import { db } from '@/lib/db';
import { generateApiKey, generateId, hashApiKey } from '@/lib/auth';
import { RegisterClientSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = RegisterClientSchema.safeParse(body);
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

    const { name, contactMobile, webhookUrl } = parsed.data;

    // Generate API key (plain text — shown once)
    const apiKey = generateApiKey();
    const hashedApiKey = await hashApiKey(apiKey);
    const clientId = generateId('cli');

    // Auto-create a default account for this client
    const accountId = generateId('acc');
    await db.accounts.create({
      id: accountId,
      name,
      type: 'integration',
      userId: null,
      createdAt: new Date().toISOString(),
    });

    // Create API client
    await db.apiClients.create({
      id: clientId,
      name,
      accountId,
      apiKey: hashedApiKey,
      status: 'active',
      rateLimit: 60, // 60 requests per minute default
      webhookUrl: webhookUrl || null,
      webhookEvents: [],
      contactMobile,
      createdAt: new Date().toISOString(),
    });

    return Response.json(
      {
        success: true,
        data: {
          clientId,
          apiKey, // ⚠️ Show only once — client must store this securely
          accountId,
          rateLimit: 60,
          message:
            'Store your API key securely. It will not be shown again.',
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
