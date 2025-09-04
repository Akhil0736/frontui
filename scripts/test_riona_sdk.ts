/* Test Riona SDK connectivity: status + login attempt */
import { RionaClient } from '../src/sdk/rionaClient';

async function main() {
  const baseURL = process.env.NEXT_PUBLIC_RIONA_API_URL || 'http://localhost:3001/api';
  const client = new RionaClient({ baseURL, credentials: 'include' });

  console.log(`[Riona SDK] Using baseURL: ${baseURL}`);

  // Check status
  try {
    const status = await client.status();
    console.log('[Riona SDK] /status OK:', status);
  } catch (e) {
    console.error('[Riona SDK] /status error:', e);
  }

  // Try login (may fail without valid IG creds). Intention is to test SDK call path.
  const username = process.env.RIONA_TEST_USERNAME || 'test_user';
  const password = process.env.RIONA_TEST_PASSWORD || 'test_password';
  try {
    const res = await client.login(username, password);
    console.log('[Riona SDK] /login response:', res);
  } catch (e) {
    console.warn('[Riona SDK] /login attempt failed (expected without valid creds):', (e as Error).message);
  }

  console.log('Riona SDK connectivity script finished.');
}

main().catch((err) => {
  console.error('Riona SDK test error:', err);
  process.exit(1);
});
