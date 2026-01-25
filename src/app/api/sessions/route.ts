/**
 * Sessions API Route
 *
 * Creates new agent sessions. Uses the agent ID from environment variable.
 */

import { z } from 'zod';
import { getOctavusClient } from '@/lib/octavus';
import { getDefaultAgentId } from '@/lib/server-config';
import { ApiError } from '@octavus/server-sdk';

const createSessionSchema = z.object({
  input: z
    .object({
      USER_NAME: z.string().optional(),
    })
    .optional(),
});

/**
 * POST /api/sessions - Create a new agent session
 *
 * Request body (optional):
 * {
 *   input?: { USER_NAME?: string }
 * }
 *
 * Response:
 * {
 *   sessionId: string
 * }
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => ({}));
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const client = getOctavusClient();
    const agentId = getDefaultAgentId();

    const sessionId = await client.agentSessions.create(agentId, parsed.data.input);

    return Response.json({ sessionId });
  } catch (error) {
    console.error('Create session error:', error);

    if (error instanceof ApiError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
