import 'server-only';

const DEFAULT_OCTAVUS_API_URL = 'https://octavus.ai';

/**
 * Get the platform URL for server-side code.
 * Uses OCTAVUS_API_URL env var with production fallback.
 */
export function getOctavusPlatformUrl(): string {
  return process.env.OCTAVUS_API_URL ?? DEFAULT_OCTAVUS_API_URL;
}

/**
 * Get the Octavus API key.
 * Required for making API calls to the platform.
 */
export function getOctavusApiKey(): string {
  const apiKey = process.env.OCTAVUS_API_KEY;
  if (!apiKey) {
    throw new Error('OCTAVUS_API_KEY environment variable is not set');
  }
  return apiKey;
}

/**
 * Get the default agent ID.
 * Set via OCTAVUS_AGENT_ID env var after syncing the agent.
 */
export function getDefaultAgentId(): string {
  const agentId = process.env.OCTAVUS_AGENT_ID;
  if (!agentId) {
    throw new Error('OCTAVUS_AGENT_ID environment variable is not set');
  }
  return agentId;
}
