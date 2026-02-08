/**
 * Arkeus Gateway Client
 * Fetches live data from Arkeus gateway on port 8787
 */

const GATEWAY_URL = process.env.ARKEUS_GATEWAY_URL || 'http://127.0.0.1:8787';
const API_KEY = process.env.ARKEUS_API_KEY || '';

interface GatewayResponse<T> {
  data?: T;
  error?: string;
}

async function gatewayFetch<T>(endpoint: string): Promise<GatewayResponse<T>> {
  try {
    const response = await fetch(`${GATEWAY_URL}${endpoint}`, {
      headers: {
        'X-API-Key': API_KEY,
      },
      // Add timeout
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return { error: `Gateway returned ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error(`Arkeus gateway fetch failed (${endpoint}):`, error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Fetch live Arkeus system status
 */
export async function getArkeusStatus() {
  return gatewayFetch('/mission-control/status');
}

/**
 * Fetch live brain body tasks from actions.jsonl
 */
export async function getArkeusTasks() {
  return gatewayFetch('/mission-control/tasks');
}

/**
 * Fetch live agent statuses (running processes)
 */
export async function getArkeusAgents() {
  return gatewayFetch('/mission-control/agents');
}

/**
 * Fetch brain metrics history
 */
export async function getArkeusMetrics(hours = 24) {
  return gatewayFetch(`/mission-control/metrics?hours=${hours}`);
}

/**
 * Fetch learning outcomes from learner DB
 */
export async function getArkeusLearning() {
  return gatewayFetch('/mission-control/learning');
}

/**
 * Check if Arkeus gateway is available
 */
export async function checkGatewayHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${GATEWAY_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
