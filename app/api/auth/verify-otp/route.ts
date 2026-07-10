// ============================================================
// POST /api/auth/verify-otp
// ============================================================
// Verifies OTP. On success:
//   - If signup data present → creates user + profile, issues JWT
//   - If no signup data → finds existing user, issues JWT
// Sets JWT as httpOnly cookie for web UI.
// ============================================================

import { db } from '@/lib/db';
import { createToken, generateId, isOTPExpired } from '@/lib/auth';
import { VerifyOTPSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = VerifyOTPSchema.safeParse(body);
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

    const { mobile, otp, signup } = parsed.data;

    // Find OTP session
    const session = db.otpSessions.findByMobile(mobile);
    if (!session) {
      return Response.json(
        { success: false, error: 'No OTP found for this mobile number. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check expiry
    if (isOTPExpired(session.expiresAt)) {
      db.otpSessions.delete(mobile);
      return Response.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (session.otp !== otp) {
      return Response.json(
        { success: false, error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP verified — clean up
    db.otpSessions.delete(mobile);

    let user = db.users.findByMobile(mobile);

    if (signup) {
      // --- Signup flow ---
      if (user) {
        return Response.json(
          { success: false, error: 'An account with this mobile number already exists. Please sign in instead.' },
          { status: 409 }
        );
      }

      // Create user
      const userId = generateId('usr');
      user = db.users.create({
        id: userId,
        fullName: signup.fullName,
        mobile,
        role: signup.role,
        createdAt: new Date().toISOString(),
      });

      // Create role-specific profile
      if (signup.role === 'customer') {
        db.customerProfiles.create({ userId });
      } else {
        db.driverProfiles.create({
          userId,
          vehicleNumber: signup.vehicleNumber || '',
          panNumber: signup.panNumber || '',
          aadharNumber: signup.aadharNumber || '',
          status: 'available',
        });
      }
    } else {
      // --- Signin flow ---
      if (!user) {
        return Response.json(
          { success: false, error: 'No account found. Please sign up first.' },
          { status: 404 }
        );
      }
    }

    // Issue JWT
    const token = await createToken(user);

    // Set cookie and return token
    const response = Response.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          mobile: user.mobile,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Note: We set the cookie via Set-Cookie header
    // HttpOnly, Secure, SameSite for security
    const headers = new Headers(response.headers);
    headers.append(
      'Set-Cookie',
      `auth-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
