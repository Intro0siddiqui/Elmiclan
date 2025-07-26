'use server';

/**
 * @fileOverview A flow for sending E2EE messages via the Matrix protocol.
 * This flow is designed to run on a secure server, protecting sensitive credentials.
 * It supports both sending to a specific user (creating a 1-to-1 DM) and sending
 * to a predefined group chat room.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
// NOTE: To prevent server startup issues, the Matrix SDK is imported dynamically
// inside the flow itself, not at the top level.

const SendSecureMessageInputSchema = z.object({
  toUserId: z.string().optional().describe('The Matrix ID of the recipient for a direct message. If omitted, sends to the main clan chat.'),
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

      // These are placeholder credentials for a public test account.
      // In a real implementation, these would be fetched securely.
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

      let roomId: string;
      
      if (toUserId) {
        // Logic for 1-to-1 Direct Message
        console.log(`Setting up 1-to-1 DM with ${toUserId}`);
        const createRoomResponse = await client.createRoom({
          is_direct: true,
          visibility: 'private',
          invite: [toUserId],
          preset: 'private_chat',
        });
        roomId = createRoomResponse.room_id;
        console.log(`Created DM room ${roomId} for ${toUserId}`);
      } else {
        // Logic for Unified Group Chat
        // This is the hardcoded ID for the main clan chat room.
        const clanRoomId = process.env.MATRIX_CLAN_ROOM_ID || '!YourMainClanRoomID:matrix.org';
        roomId = clanRoomId;
        console.log(`Targeting unified clan chat room: ${roomId}`);
        
        // Ensure the bot is a member of the clan room.
        const room = client.getRoom(clanRoomId);
        if (!room) {
            console.log(`Bot is not in room ${clanRoomId}. Attempting to join...`);
            await client.joinRoom(clanRoomId);
            console.log(`Successfully joined room ${clanRoomId}.`);
        }
      }

      // Wait for the room to be encrypted
      console.log(`Waiting for room ${roomId} to be encrypted...`);
      await client.waitForRoomToBeEncrypted(roomId);
      console.log('Room is encrypted.');

      // Send the message
      const content = {
        body: message,
        msgtype: 'm.text',
      };
      console.log(`Sending message to room ${roomId}`);
      await client.sendMessage(roomId, content);
      console.log('Message sent successfully.');
      
      return { success: true, roomId: roomId };

    } catch (e: any) {
      console.error('Matrix send failed:', e);
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
