import { env } from '@/env.mjs';
import * as sdk from 'matrix-js-sdk';

let client: any = null;

export async function getMatrixClient() {
  if (client) {
    return client;
  }

  client = sdk.createClient({
    baseUrl: env.MATRIX_BASE_URL,
    accessToken: env.MATRIX_ACCESS_TOKEN,
    userId: env.MATRIX_USER_ID,
  });

  await client.startClient({ initialSyncLimit: 1 });

  await new Promise<void>((resolve) => {
    client.on('sync', (state: string) => {
      if (state === 'PREPARED') resolve();
    });
  });

  return client;
}
