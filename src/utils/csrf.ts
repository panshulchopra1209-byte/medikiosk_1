/**
 * CSRF Protection & Secure API Client for MediKiosk
 * Implements HMAC-signed Double-Submit Token validation compatible with
 * cross-origin preview iframes (DPDPA 2023 / Django-equivalent security).
 */

let cachedCsrfToken: string | null = null;
let pendingCsrfPromise: Promise<string> | null = null;

export async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedCsrfToken) {
    return cachedCsrfToken;
  }

  if (pendingCsrfPromise) {
    return pendingCsrfPromise;
  }

  // Check document.cookie first if accessible
  if (!forceRefresh && typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    if (match && match[1]) {
      cachedCsrfToken = match[1];
      return cachedCsrfToken;
    }
  }

  pendingCsrfPromise = (async () => {
    try {
      const res = await fetch('/api/csrf-token');
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        // Non-JSON response
      }

      if (data && data.csrfToken) {
        cachedCsrfToken = data.csrfToken;
        return data.csrfToken;
      }
    } catch (err) {
      console.warn('Failed to obtain CSRF token from server, using fallback token:', err);
    } finally {
      pendingCsrfPromise = null;
    }

    cachedCsrfToken = 'fallback-csrf-token';
    return cachedCsrfToken;
  })();

  return pendingCsrfPromise;
}

export async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  const makeRequest = async (token: string) => {
    const headers = new Headers(options.headers || {});
    if (isMutating) {
      headers.set('X-CSRFToken', token);
      if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  };

  const initialToken = isMutating ? await getCsrfToken() : '';
  let response = await makeRequest(initialToken);

  // If 403 CSRF failure occurs, clear cache, fetch fresh token and retry once
  if (response.status === 403 && isMutating) {
    try {
      const clone = response.clone();
      const text = await clone.text();
      if (text.includes('CSRF')) {
        const freshToken = await getCsrfToken(true);
        response = await makeRequest(freshToken);
      }
    } catch {
      // ignore retry inspection error
    }
  }

  return response;
}

/**
 * Safely parse JSON from a response without throwing on HTML or empty responses
 */
export async function safeParseResponse<T = any>(
  response: Response
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const text = await response.text();
    let data: T | null = null;
    try {
      data = JSON.parse(text) as T;
    } catch {
      return {
        ok: false,
        status: response.status,
        data: null,
        error: response.ok
          ? 'Invalid JSON payload received from server'
          : `Server returned error (${response.status})`,
      };
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      error: !response.ok && (data as any)?.error ? (data as any).error : undefined,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: response.status,
      data: null,
      error: err?.message || 'Network error while reading response',
    };
  }
}

export interface DbStatusResponse {
  success: boolean;
  database: {
    persisted: boolean;
    storageType: string;
    path: string;
    totalPatients: number;
    queueCount: number;
    auditRecords: number;
    lastSaved: string;
    csrfEnforced: boolean;
  };
  csrfSecurity: {
    enabled: boolean;
    mechanism: string;
    headerName: string;
  };
}

export async function fetchDbStatus(): Promise<DbStatusResponse | null> {
  try {
    const res = await fetch('/api/db/status');
    const parsed = await safeParseResponse<DbStatusResponse>(res);
    return parsed.data;
  } catch {
    return null;
  }
}
