// ============================================================
// POST /api/auth/send-otp
// ============================================================
// Generates a 4-digit OTP for the given mobile number.
// In dev mode, the OTP is returned in the response (shown in UI banner).
// In production, this would trigger SMS via Firebase/Twilio.
// ============================================================

import { db } from '@/lib/db';
import { generateOTP, getOTPExpiry } from '@/lib/auth';
import { SendOTPSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = SendOTPSchema.safeParse(body);
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

    const { mobile, role } = parsed.data;

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Store OTP session (overwrites any existing one for this mobile)
    db.otpSessions.create({
      mobile,
      otp,
      expiresAt,
      verified: false,
    });

    // In dev mode, return the OTP in the response
    // In production, send SMS and don't return OTP
    return Response.json(
      {
        success: true,
        message: 'OTP sent successfully',
        // DEV ONLY: Remove in production
        _dev_otp: otp,
      },
      { status: 200 }
    );
  } catch {
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
