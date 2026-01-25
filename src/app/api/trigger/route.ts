/**
 * Agent Trigger API Route
 *
 * Handles triggering agent actions and streaming responses via SSE.
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { toSSEStream } from '@octavus/server-sdk';
import { getOctavusClient } from '@/lib/octavus';
import { assistantConfig } from '@/lib/agents/assistant';

const triggerRequestSchema = z.object({
  sessionId: z.string().min(1),
  triggerName: z.string().min(1),
  input: z.record(z.string(), z.unknown()).optional(),
});

/**
 * POST /api/trigger - Trigger an agent action and stream the response
 *
 * Request body:
 * {
 *   sessionId: string,
 *   triggerName: string,
 *   input?: Record<string, unknown>
 * }
 *
 * Response: SSE stream of agent events
 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = triggerRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'Missing required fields: sessionId, triggerName' },
        { status: 400 },
      );
    }

    const { sessionId, triggerName, input } = parsed.data;

    const client = getOctavusClient();

    // Attach to session with tool handlers and resources
    const session = client.agentSessions.attach(sessionId, {
      tools: assistantConfig.tools,
      resources: assistantConfig.resources,
    });

    const events = session.trigger(triggerName, input, {
      signal: request.signal,
    });

    return new Response(toSSEStream(events), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Trigger error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
