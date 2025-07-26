
'use server';
/**
 * @fileOverview A flow for sending end-to-end encrypted messages via Matrix.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as sdk from 'matrix-js-sdk';

// WARNING: In a real app, you would not hardcode credentials.
// They would be fetched securely for the authenticated user, e.g., from Firestore.
const MATRIX_USER_ID = process.env.MATRIX_USER_ID || '@elmiclan-bot:matrix.org';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN_HERE';
const MATRIX_HOMESERVER = process.env.MATRIX_HOMESERVER || 'https://matrix.org';

export const SendSecureMessageInputSchema = z.object({
  toUserId: z.string().describe("The recipient's Matrix user ID (e.g., @bob:matrix.org)."),
  message: z.string().describe('The plain-text message to send.'),
  fromUid: z.string().describe('The UID of the sending user for authentication purposes.')
});
export type SendSecureMessageInput = z.infer<typeof SendSecureMessageInputSchema>;

export const SendSecureMessageOutputSchema = z.object({
  success: z.boolean(),
  roomId: z.string().optional(),
  error: z.string().optional(),
});
export type SendSecureMessageOutput = z.infer<typeof SendSecureMessageOutputSchema>;


let matrixClient: sdk.MatrixClient | null = null;

async function getMatrixClient() {
    if (matrixClient) {
        // Ensure the client is started and crypto is initialized
        if (!matrixClient.isCryptoEnabled()) {
            await matrixClient.initCrypto();
        }
        if (!matrixClient.isClientRunning()) {
            await matrixClient.startClient({ initialSyncLimit: 10 });
        }
        return matrixClient;
    }

    const client = sdk.createClient({
        baseUrl: MATRIX_HOMESERVER,
        accessToken: MATRIX_ACCESS_TOKEN,
        userId: MATRIX_USER_ID,
    });

    await client.initCrypto();
    await client.startClient({ initialSyncLimit: 10 });

    // Wait for crypto to be ready
    await new Promise<void>((resolve) => {
        client.once('crypto.initialised' as any, (initialised) => {
            if (initialised) {
                resolve();
            }
        });
    });

    matrixClient = client;
    return matrixClient;
}


export async function sendSecureMessage(input: SendSecureMessageInput): Promise<SendSecureMessageOutput> {
  // In a real implementation, you would perform a security check here to ensure
  // the fromUid matches the authenticated user session.
  console.log(`Request from user ${input.fromUid} to send message.`);
  return sendSecureMessageFlow(input);
}


const sendSecureMessageFlow = ai.defineFlow(
  {
    name: 'sendSecureMessageFlow',
    inputSchema: SendSecureMessageInputSchema,
    outputSchema: SendSecureMessageOutputSchema,
  },
  async ({ toUserId, message }) => {
    try {
        const mx = await getMatrixClient();

        // 1. Find or create a direct, encrypted room
        const rooms = mx.getRooms();
        let room = rooms.find(r => {
            const memberIds = r.getInvitedAndJoinedMemberIds();
            return memberIds.length === 2 && memberIds.includes(toUserId) && memberIds.includes(MATRIX_USER_ID);
        });

        let roomId = room?.roomId;

        if (!roomId) {
            console.log(`No existing room found with ${toUserId}. Creating a new one.`);
            const creationResult = await mx.createRoom({
                preset: 'trusted_private_chat',
                invite: [toUserId],
                is_direct: true,
                visibility: 'private',
                initial_state: [
                    {
                        type: 'm.room.encryption',
                        state_key: '',
                        content: { algorithm: 'm.megolm.v1.aes-sha2' },
                    },
                ],
            });
            roomId = creationResult.room_id;
            console.log(`Created room ${roomId}.`);
        } else {
            console.log(`Found existing room ${roomId} with ${toUserId}.`);
        }

        // 2. Wait until the room is ready for encryption
        await mx.waitForRoomToBeEncrypted(roomId, { timeout: 10000 });
        console.log(`Room ${roomId} is encrypted.`);

        // 3. Send the message
        await mx.sendTextMessage(roomId, message);
        console.log(`Message sent to room ${roomId}.`);

        return { success: true, roomId };
    } catch (e: any) {
        console.error('Matrix send failed:', e);
        // If client is running, stop it to clean up for next attempt
        if (matrixClient && matrixClient.isClientRunning()) {
            matrixClient.stopClient();
            matrixClient = null;
        }
        return { success: false, error: e.message || 'An unknown error occurred.' };
    }
  }
);
