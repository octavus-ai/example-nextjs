/**
 * Agent Trigger API Route
 *
 * Handles both trigger and continuation requests, streaming responses via SSE.
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { toSSEStream } from '@octavus/server-sdk';
import { getOctavusClient } from '@/lib/octavus';
import { assistantConfig } from '@/lib/agents/assistant';

/** Schema for tool results in continuation requests */
const toolResultSchema = z.object({
  toolCallId: z.string().min(1),
  result: z.unknown(),
});

/** Schema for trigger requests */
const triggerRequestSchema = z.object({
  sessionId: z.string().min(1),
  type: z.literal('trigger'),
  triggerName: z.string().min(1),
  input: z.record(z.string(), z.unknown()).optional(),
});

/** Schema for continuation requests (client tool results) */
const continueRequestSchema = z.object({
  sessionId: z.string().min(1),
  type: z.literal('continue'),
  executionId: z.string().min(1),
  toolResults: z.array(toolResultSchema).min(1),
});

/** Combined schema for all request types */
const requestBodySchema = z.discriminatedUnion('type', [
  triggerRequestSchema,
  continueRequestSchema,
]);

/**
 * POST /api/trigger - Handle agent requests (trigger or continuation)
 *
 * Request body:
 * - Trigger: { sessionId, type: 'trigger', triggerName, input? }
 * - Continue: { sessionId, type: 'continue', executionId, toolResults }
 *
 * Response: SSE stream of agent events
 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = requestBodySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: 'Invalid request body',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { sessionId, ...sessionRequest } = parsed.data;

    const client = getOctavusClient();

    // Attach to session with tool handlers and resources
    const session = client.agentSessions.attach(sessionId, {
      tools: assistantConfig.tools,
      resources: assistantConfig.resources,
    });

    // execute() handles both triggers and continuations
    const events = session.execute(sessionRequest, {
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
