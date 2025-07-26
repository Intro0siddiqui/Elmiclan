'use server';

/**
 * @fileOverview A flow for fetching recent messages from the main clan chat room.
 * This flow is designed to run on a secure server, protecting sensitive credentials.
 * It supports pagination to allow for fetching older messages.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
// NOTE: To prevent server startup issues, the Matrix SDK is imported dynamically
// inside the flow itself, not at the top level.

const FetchMessagesInputSchema = z.object({
  from: z.string().optional().describe('The pagination token from a previous request to fetch the next batch of older messages.'),
  limit: z.number().optional().default(25).describe('The maximum number of messages to return.'),
});
export type FetchMessagesInput = z.infer<typeof FetchMessagesInputSchema>;

export const MessageSchema = z.object({
    id: z.string(),
    sender: z.string(),
    content: z.string(),
    timestamp: z.number(),
});

const FetchMessagesOutputSchema = z.object({
  messages: z.array(MessageSchema),
  nextFrom: z.string().nullable().describe('The pagination token to use in the next request to get older messages. Null if at the start of the history.'),
});
export type FetchMessagesOutput = z.infer<typeof FetchMessagesOutputSchema>;

export async function fetchMessages(input: FetchMessagesInput): Promise<FetchMessagesOutput> {
  return fetchMessagesFlow(input);
}

const fetchMessagesFlow = ai.defineFlow(
  {
    name: 'fetchMessagesFlow',
    inputSchema: FetchMessagesInputSchema,
    outputSchema: FetchMessagesOutputSchema,
  },
  async ({ from, limit }) => {
    let client: any = null;
    try {
        const sdk = await import('matrix-js-sdk');

        const matrixUserId = process.env.MATRIX_USER_ID || '@elmiclan-bot:matrix.org';
        const matrixAccessToken = process.env.MATRIX_ACCESS_TOKEN || 'syt_ZWxtaWNsYW4tYm90_aVJhZGRpY2xlQnJvY2NvbGk_U3VwZXJTZWNyZXQ';
        const matrixBaseUrl = process.env.MATRIX_BASE_URL || 'https://matrix.org';
        const clanRoomId = process.env.MATRIX_CLAN_ROOM_ID || '!YourMainClanRoomID:matrix.org';
        
        client = sdk.createClient({
            baseUrl: matrixBaseUrl,
            accessToken: matrixAccessToken,
            userId: matrixUserId,
        });

        await client.startClient({ initialSyncLimit: 1 });
        
        await new Promise<void>((resolve) => {
            client.on('sync', (state: string) => {
                if (state === 'PREPARED') resolve();
            });
        });

        const room = client.getRoom(clanRoomId);
        if (!room) {
            throw new Error('Clan chat room not found or bot is not a member.');
        }

        // scrollback returns a timeline, with `events` being the messages
        // and `end` being the token for the *next* batch of older messages.
        const timeline = await client.scrollback(room, limit, from);
        
        if (!timeline) {
            return { messages: [], nextFrom: null };
        }

        const messages = timeline.events
            .filter((event: any) => event.type === 'm.room.message' && event.content.msgtype === 'm.text' && event.content.body)
            .map((event: any) => ({
                id: event.event_id,
                sender: event.sender,
                content: event.content.body,
                timestamp: event.origin_server_ts,
            }));
        
        return {
            messages: messages, // The SDK returns messages from oldest to newest in the batch
            nextFrom: timeline.end,
        };

    } catch (e: any) {
        console.error('Matrix fetch failed:', e);
        // Don't rethrow, just return an empty set.
        return { messages: [], nextFrom: null };
    } finally {
        if (client) {
            client.stopClient();
        }
    }
  }
);
