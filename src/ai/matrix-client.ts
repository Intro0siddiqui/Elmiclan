import { env } from '@/env.mjs';
import * as sdk from 'matrix-js-sdk';
import { supabase } from '@/lib/supabase';

let botClient: any = null;

export async function getMatrixClient(userId?: string) {
  // User-specific client
  if (userId) {
    const { data, error } = await supabase
      .from('matrix_tokens')
      .select('matrix_user_id, access_token')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new Error('Matrix token not found for user');
    }

    const userClient = sdk.createClient({
      baseUrl: env.MATRIX_BASE_URL,
      accessToken: data.access_token,
      userId: data.matrix_user_id,
    });

    await initializeClient(userClient);
    return userClient;
  }

  // Bot client singleton
  if (!botClient) {
    botClient = sdk.createClient({
      baseUrl: env.MATRIX_BASE_URL,
      accessToken: env.MATRIX_ACCESS_TOKEN,
      userId: env.MATRIX_USER_ID,
    });
    await initializeClient(botClient);
  }
  return botClient;
}

async function initializeClient(client: any) {
  if (client.getSyncState() === null) {
    await client.startClient({ initialSyncLimit: 1 });
    await new Promise<void>((resolve) => {
      client.on('sync', (state: string) => {
        if (state === 'PREPARED') resolve();
      });
    });
  }
}
