'use server';

/**
 * @fileOverview A flow for sending E2EE messages via the Matrix protocol.
 * This flow is designed to run on a secure server, protecting sensitive credentials.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
// NOTE: To prevent server startup issues, the Matrix SDK is imported dynamically
// inside the flow itself, not at the top level.

const SendSecureMessageInputSchema = z.object({
  // toUserId is kept for schema compatibility with the frontend, but is no longer used
  // to determine the room.
  toUserId: z.string().optional(),
  message: z.string().describe('The plain-text message to send.'),
});
export type SendSecureMessageInput = z.infer<typeof SendSecureMessageInputSchema>;

const SendSecureMessageOutputSchema = z.object({
  success: z.boolean(),
  roomId: z.string().optional(),
  error: z.string().optional(),
});
export type SendSecureMessageOutput = z.infer<typeof SendSecureMessageOutputSchema>;


export async function sendSecureMessage(input: SendSecureMessageInput): Promise<SendSecureMessageOutput> {
  return sendSecureMessageFlow(input);
}


const sendSecureMessageFlow = ai.defineFlow(
  {
    name: 'sendSecureMessageFlow',
    inputSchema: SendSecureMessageInputSchema,
    outputSchema: SendSecureMessageOutputSchema,
  },
  async ({ message }) => {
    let client: any = null;
    try {
      // This is the hardcoded ID for the main clan chat room.
      // In a real application, an admin would create this room in Matrix
      // and the ID would be stored as a secure environment variable.
      const clanRoomId = process.env.MATRIX_CLAN_ROOM_ID || '!YourMainClanRoomID:matrix.org';

      // Dynamically import the SDK when the flow is invoked
      const sdk = await import('matrix-js-sdk');

      // In a real implementation, these would be fetched securely for the calling user.
      // These are placeholder credentials for a public test account.
      const matrixUserId = process.env.MATRIX_USER_ID || '@elmiclan-bot:matrix.org';
      const matrixAccessToken = process.env.MATRIX_ACCESS_TOKEN || 'syt_ZWxtaWNsYW4tYm90_aVJhZGRpY2xlQnJvY2NvbGk_U3VwZXJTZWNyZXQ';
      const matrixBaseUrl = process.env.MATRIX_BASE_URL || 'https://matrix.org';
      
      console.log(`Initializing Matrix client for ${matrixUserId}`);
      client = sdk.createClient({
        baseUrl: matrixBaseUrl,
        accessToken: matrixAccessToken,
        userId: matrixUserId,
      });

      console.log('Initializing crypto store...');
      await client.initCrypto();
      
      console.log('Starting client...');
      await client.startClient({ initialSyncLimit: 10 });
      
      // Ensure the client is ready and synced
      await new Promise<void>((resolve) => {
        client.on('sync', (state: string) => {
          if (state === 'PREPARED') {
            console.log('Client synced and prepared.');
            resolve();
          }
        });
      });

      // Ensure the bot is a member of the clan room.
      // An admin would need to invite the bot user to the room first.
      const room = client.getRoom(clanRoomId);
      if (!room) {
          console.log(`Bot is not in room ${clanRoomId}. Attempting to join...`);
          await client.joinRoom(clanRoomId);
          console.log(`Successfully joined room ${clanRoomId}.`);
      }

      // 1) Wait for the room to be encrypted
      console.log('Waiting for room to be encrypted...');
      await client.waitForRoomToBeEncrypted(clanRoomId);
      console.log('Room is encrypted.');

      // 2) Send the message
      const content = {
        body: message,
        msgtype: 'm.text',
      };
      console.log(`Sending message to clan room ${clanRoomId}`);
      await client.sendMessage(clanRoomId, content);
      console.log('Message sent successfully.');
      
      return { success: true, roomId: clanRoomId };

    } catch (e: any) {
      console.error('Matrix send failed:', e);
      // Provide a more user-friendly error if the room is not found
      if (e.errcode === 'M_NOT_FOUND') {
        return {
          success: false,
          error: 'The main clan chat room was not found. Please contact an administrator to set it up.',
        };
      }
      return {
        success: false,
        error: e.message || 'An unknown error occurred during the Matrix operation.',
      };
    } finally {
      if (client) {
        console.log('Stopping Matrix client.');
        client.stopClient();
      }
    }
  }
);
