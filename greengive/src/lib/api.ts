
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000); 

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_URL}${path}`, { 
      ...options, 
      headers,
      signal: controller.signal 
    });

    clearTimeout(id);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || `API error ${res.status}`);
    }

    return res.json();
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Request timed out (Backend slow or offline)');
    throw err;
  }
}



export async function createCheckoutSession(
  priceId: string,
  userId: string,
  email: string,
  token: string
) {
  return apiFetch<{ url: string }>('/api/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify({ priceId, userId, email }),
  }, token);
}

export async function createPortalSession(userId: string, token: string) {
  return apiFetch<{ url: string }>('/api/stripe/portal', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }, token);
}



export async function getScores(token: string) {
  return apiFetch<{ data: any[] }>('/api/scores', { method: 'GET' }, token);
}

export async function submitScore(score: number, played_at: string, token: string) {
  return apiFetch<{ success: boolean; data: any }>('/api/scores', {
    method: 'POST',
    body: JSON.stringify({ score, played_at }),
  }, token);
}

export async function deleteScore(id: string, token: string) {
  return apiFetch<{ success: boolean }>(`/api/scores/${id}`, {
    method: 'DELETE',
  }, token);
}



export async function simulateDraw(month: string, logic: string, token: string) {
  return apiFetch('/api/draws/simulate', {
    method: 'POST',
    body: JSON.stringify({ month, logic }),
  }, token);
}

export async function publishDraw(payload: any, token: string) {
  return apiFetch('/api/draws/publish', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}


export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_URL}/health`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}
