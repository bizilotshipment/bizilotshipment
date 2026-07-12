import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_SWITCHER !== 'true') {
    return NextResponse.json({ error: 'Not enabled' }, { status: 403 });
  }
  
  const users = await db.users.findMany();
  return NextResponse.json({ success: true, users });
}
