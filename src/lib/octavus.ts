import 'server-only';

import { OctavusClient } from '@octavus/server-sdk';
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
