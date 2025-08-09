'use server';

/**
 * @fileOverview A flow for sending E2EE messages via the Matrix protocol.
 * This flow is designed to run on a secure server, protecting sensitive credentials.
 * It supports sending to a specific user, to a group chat room, and allows for
 * rank-restricted messages in the group chat.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getMatrixClient } from '../matrix-client';
import { env } from '@/env.mjs';
import { FlowResult } from '@/lib/types';
import { supabase } from '@/lib/supabase';

const SendSecureMessageInputSchema = z.object({
  toUserId: z.string().optional().describe('The Matrix ID of the recipient for a direct message. If omitted, sends to the main clan chat.'),
  message: z.string().describe('The plain-text message to send.'),
  rankRestricted: z.boolean().optional().default(false).describe('If true, the message in the clan chat will only be visible to users of the same rank or higher.'),
});
export type SendSecureMessageInput = z.infer<typeof SendSecureMessageInputSchema>;

const SendSecureMessageOutputSchema = z.object({
  roomId: z.string(),
});
export type SendSecureMessageOutput = z.infer<typeof SendSecureMessageOutputSchema>;

const SendSecureMessageFlowResultSchema = z.union([
  z.object({ success: z.literal(true), data: SendSecureMessageOutputSchema }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export async function sendSecureMessage(input: SendSecureMessageInput): Promise<FlowResult<SendSecureMessageOutput>> {
  return sendSecureMessageFlow(input);
}

const RANK_RESTRICTED_PREFIX = '[RANK_RESTRICTED]';

// New registration flow
export const registerMatrixUser = ai.defineFlow({
  name: 'registerMatrixUser',
  inputSchema: z.object({
    userId: z.string().describe('Supabase user ID'),
    username: z.string().describe('Desired Matrix username'),
    password: z.string().describe('Matrix account password'),
  }),
  outputSchema: z.object({
    matrixUserId: z.string(),
  }),
}, async ({ userId, username, password }) => {
  try {
    const botClient = await getMatrixClient();
    
    // Generate unique device ID
    const deviceId = `ELMI_${Date.now()}`;

    // Attempt registration
    const result = await botClient.registerRequest({
      username,
      password,
      device_id: deviceId,
      auth: { type: 'm.login.dummy' } // Fallback for simple auth
    });

    // Handle interactive auth if needed
    if (result.flows) {
      // Solve CAPTCHA/TOS challenges here
      // For now we'll throw an error if interactive auth is required
      throw new Error('Interactive auth required - not implemented');
    }

    // Store credentials
    const { error } = await supabase
      .from('matrix_tokens')
      .upsert({
        user_id: userId,
        matrix_user_id: result.user_id,
        access_token: result.access_token,
        device_id: deviceId,
      });

    if (error) {
      throw new Error('Failed to store Matrix credentials');
    }

    return { matrixUserId: result.user_id };
  } catch (e: any) {
    console.error('Matrix registration failed:', e);
    throw new Error(e.message || 'Matrix registration failed');
  }
});

const sendSecureMessageFlow = ai.defineFlow(
  {
    name: 'sendSecureMessageFlow',
    inputSchema: SendSecureMessageInputSchema,
    outputSchema: SendSecureMessageFlowResultSchema,
  },
  async ({ toUserId, message, rankRestricted }): Promise<FlowResult<SendSecureMessageOutput>> => {
    try {
      const client = await getMatrixClient();

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
        const clanRoomId = env.MATRIX_CLAN_ROOM_ID;
        roomId = clanRoomId;
        console.log(`Targeting unified clan chat room: ${roomId}`);
        
        let room = client.getRoom(clanRoomId);
        if (!room) {
            console.log(`Bot is not in room ${clanRoomId}. Attempting to join...`);
            await client.joinRoom(clanRoomId);
            room = client.getRoom(clanRoomId);
            console.log(`Successfully joined room ${clanRoomId}.`);
        }
      }

      console.log(`Waiting for room ${roomId} to be encrypted...`);
      await client.waitForRoomToBeEncrypted(roomId);
      console.log('Room is encrypted.');

      // Prepend a marker if the message is rank-restricted
      const finalMessage = rankRestricted && !toUserId
        ? `${RANK_RESTRICTED_PREFIX}${message}`
        : message;

      const content = {
        body: finalMessage,
        msgtype: 'm.text',
      };

      console.log(`Sending message to room ${roomId}`);
      await client.sendMessage(roomId, content);
      console.log('Message sent successfully.');
      
      return { success: true, data: { roomId } };

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
    }
  }
);
