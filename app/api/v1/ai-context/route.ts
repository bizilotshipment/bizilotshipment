import { AIContext } from '@/lib/ai';

export async function GET() {
  // Exclude the 'prompts' functions from the JSON output since they are executable code
  // and the JSON endpoint is meant for structured machine-readable data.
  const { prompts, ...serializableContext } = AIContext;

  return Response.json(
    {
      success: true,
      data: serializableContext
    },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    }
  );
}
