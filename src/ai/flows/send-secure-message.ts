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
  toUserId: z.string().describe("The recipient's Matrix ID (e.g., '@bob:matrix.org')."),
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
  async ({ toUserId, message }) => {
    let client: any = null;
    try {
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

      // 1) Find an existing 1-to-1 room or create a new one
      console.log(`Searching for room with ${toUserId}`);
      const rooms = client.getRooms();
      let roomId = rooms.find((r: any) => {
        const members = r.getInvitedAndJoinedMemberIds();
        return members.includes(toUserId) && members.length === 2;
      })?.roomId;
      
      if (!roomId) {
        console.log(`No existing room found. Creating a new one...`);
        const createRoomResponse = await client.createRoom({
          preset: 'trusted_private_chat',
          invite: [toUserId],
          is_direct: true,
          initial_state: [
            {
              type: 'm.room.encryption',
              state_key: '',
              content: { algorithm: 'm.megolm.v1.aes-sha2' },
            },
          ],
        });
        roomId = createRoomResponse.room_id;
        console.log(`Created room with ID: ${roomId}`);
      } else {
        console.log(`Found existing room with ID: ${roomId}`);
      }
      
      // 2) Wait for the room to be encrypted
      console.log('Waiting for room to be encrypted...');
      await client.waitForRoomToBeEncrypted(roomId);
      console.log('Room is encrypted.');

      // 3) Send the message
      const content = {
        body: message,
        msgtype: 'm.text',
      };
      console.log(`Sending message to room ${roomId}`);
      await client.sendMessage(roomId, content);
      console.log('Message sent successfully.');
      
      return { success: true, roomId };

    } catch (e: any) {
      console.error('Matrix send failed:', e);
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