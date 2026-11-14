/**
 * Sessions API Route
 *
 * Creates new agent sessions. Uses the agent ID from environment variable.
 */

import { z } from 'zod';
import { getOctavusClient, toErrorResponse } from '@/lib/octavus';
import { getDefaultAgentId } from '@/lib/server-config';

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

    const { id: sessionId } = await client.sessions.create(agentId, parsed.data.input);

    return Response.json({ sessionId });
  } catch (error) {
    console.error('Create session error:', error);
    return toErrorResponse(error, 'Failed to create session');
  }
}
