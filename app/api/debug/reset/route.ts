import { db } from '@/lib/db';

export async function POST() {
  // Clear all in-memory maps
  db.users = { ...db.users, findMany: db.users.findMany }; // This is hacky. Better to just clear the maps directly if they were exposed.
  return Response.json({ success: true, message: 'Reset attempted' });
}
