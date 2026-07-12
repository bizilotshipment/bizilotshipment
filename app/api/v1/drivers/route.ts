// ============================================================
// GET /api/v1/drivers
// ============================================================
// Returns list of available drivers with non-sensitive info.
// ============================================================

import { db } from '@/lib/db';
import { getApiKeyFromRequest } from '@/lib/auth';
import type { PublicDriverInfo } from '@/lib/types';

export async function GET(request: Request) {
  try {
    // Authenticate
    const apiKey = getApiKeyFromRequest(request);
    if (!apiKey) {
      return Response.json(
        { success: false, error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    const client = await db.apiClients.findByApiKey(apiKey);
    if (!client) {
      return Response.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Get all driver profiles
    const driverProfiles = await db.driverProfiles.findMany();

    const driverProfilesRaw = await Promise.all(
      driverProfiles.map(async (profile) => {
        const user = await db.users.findById(profile.userId);
        if (!user) return null;
        return {
          id: user.id,
          name: user.fullName,
          vehicleNumber: profile.vehicleNumber,
          status: profile.status,
        };
      })
    );
    const drivers: PublicDriverInfo[] = driverProfilesRaw.filter((d): d is PublicDriverInfo => d !== null);

    return Response.json({
      success: true,
      data: { drivers },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
