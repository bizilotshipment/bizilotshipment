// ============================================================
// GET /api/auth/me
// ============================================================
// Returns the current authenticated user from JWT.
// ============================================================

import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const payload = await getUserFromRequest(request);
    if (!payload) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await db.users.findById(payload.userId);
    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get role-specific profile
    let profile = null;
    if (user.role === 'customer') {
      profile = await db.customerProfiles.findByUserId(user.id);
    } else {
      profile = await db.driverProfiles.findByUserId(user.id);
    }

    return Response.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/auth/logout
// ============================================================
// Clears the auth cookie.
// ============================================================

export async function POST() {
  const response = Response.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );

  const headers = new Headers(response.headers);
  headers.append(
    'Set-Cookie',
    'auth-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  );

  return new Response(response.body, {
    status: 200,
    headers,
  });
}
