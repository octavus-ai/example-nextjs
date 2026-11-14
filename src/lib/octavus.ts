import 'server-only';

import { OctavusClient, OctavusError } from '@octavus/server-sdk';
import { getOctavusPlatformUrl, getOctavusApiKey } from './server-config';

/**
 * Get the Octavus client instance.
 * Creates a new client on each call (stateless).
 */
export function getOctavusClient(): OctavusClient {
  return new OctavusClient({
    baseUrl: getOctavusPlatformUrl(),
    apiKey: getOctavusApiKey(),
  });
}

/**
 * Turn a failed call into a JSON error response.
 *
 * An `OctavusError` is answered with its status and the platform's error
 * body, the shape `OctavusError.fromApiResponse()` reads back.
 */
export function toErrorResponse(error: unknown, fallbackMessage: string): Response {
  if (OctavusError.isInstance(error)) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
        type: error.errorType,
        retryable: error.retryable,
        retryAfter: error.retryAfter,
        requestId: error.requestId,
        issues: error.issues,
      },
      { status: error.status ?? 500 },
    );
  }

  return Response.json(
    { error: error instanceof Error ? error.message : fallbackMessage },
    { status: 500 },
  );
}
