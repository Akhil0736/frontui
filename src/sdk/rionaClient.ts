/* Riona Client SDK for FrontUI */

export type RionaClientOptions = {
  baseURL?: string; // e.g., http://localhost:3001/api
  credentials?: RequestCredentials; // default: 'include' (for cookie JWT)
};

export type EnqueueActionsRequest = {
  actions: any[]; // aligns with riona/src/worker/taskQueue.ts ActionTask[]
};

export type EnqueueActionsResponse = {
  id: string;
  statusUrl: string;
};

export class RionaClient {
  private baseURL: string;
  private credentials: RequestCredentials;

  constructor(opts: RionaClientOptions = {}) {
    this.baseURL = opts.baseURL || process.env.NEXT_PUBLIC_RIONA_API_URL || 'http://localhost:3001/api';
    this.credentials = opts.credentials || 'include';
  }

  private async req(path: string, init?: RequestInit) {
    const res = await fetch(`${this.baseURL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      credentials: this.credentials,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Riona API error ${res.status}: ${text}`);
    }
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return res.text();
  }

  // Auth
  // Deprecated: backend now expects sessionId. Use loginWithSession instead.
  login(_username: string, _password: string) {
    throw new Error('login(username,password) is deprecated. Use loginWithSession(sessionId, username?)');
  }
  loginWithSession(sessionId: string, username?: string) {
    return this.req('/login', { method: 'POST', body: JSON.stringify({ sessionId, username }) });
  }
  me() {
    return this.req('/me', { method: 'GET' });
  }
  logout() {
    return this.req('/logout', { method: 'POST' });
  }

  // Status
  status() {
    return this.req('/status', { method: 'GET' });
  }

  // Actions
  enqueueActions(payload: EnqueueActionsRequest) {
    return this.req('/actions', { method: 'POST', body: JSON.stringify(payload) }) as Promise<EnqueueActionsResponse>;
  }
  getActionStatus(id: string) {
    return this.req(`/actions/${id}`, { method: 'GET' });
  }

  // DMs and interactions
  interact() {
    return this.req('/interact', { method: 'POST' });
  }
  dm(username: string, message: string) {
    return this.req('/dm', { method: 'POST', body: JSON.stringify({ username, message }) });
  }
  dmFromFile(file: string, message: string, mediaPath?: string) {
    return this.req('/dm-file', { method: 'POST', body: JSON.stringify({ file, message, mediaPath }) });
  }

  // Scrape followers
  scrapeFollowers(targetAccount: string, maxFollowers?: number, download?: boolean) {
    if (download) {
      const url = new URL(`${this.baseURL}/scrape-followers`);
      url.searchParams.set('targetAccount', targetAccount);
      if (maxFollowers != null) url.searchParams.set('maxFollowers', String(maxFollowers));
      return fetch(url.toString(), { method: 'GET', credentials: this.credentials });
    }
    return this.req('/scrape-followers', { method: 'POST', body: JSON.stringify({ targetAccount, maxFollowers }) });
  }

  // Maintenance
  clearCookies() {
    return this.req('/clear-cookies', { method: 'DELETE' });
  }
  exit() {
    return this.req('/exit', { method: 'POST' });
  }
}

export const rionaClient = new RionaClient();
