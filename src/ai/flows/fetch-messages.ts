'use server';

/**
 * @fileOverview A flow for fetching recent messages from the main clan chat room.
 * This flow is designed to run on a secure server, protecting sensitive credentials.
 * It supports pagination, rank-restricted messages, and includes membership events.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MessageSchema, rankHierarchy, Rank, FlowResult } from '@/lib/types';
import { getUserRank } from './get-user-rank';
import { getMatrixClient } from '../matrix-client';
import { env } from '@/env.mjs';

const FetchMessagesInputSchema = z.object({
  from: z.string().optional().describe('The pagination token from a previous request to fetch the next batch of older messages.'),
  limit: z.number().optional().default(25).describe('The maximum number of events to return.'),
  requestingUserRank: z.nativeEnum(Rank).describe("The rank of the user requesting the messages, for visibility checks."),
});
export type FetchMessagesInput = z.infer<typeof FetchMessagesInputSchema>;

const FetchMessagesOutputSchema = z.object({
  messages: z.array(MessageSchema),
  nextFrom: z.string().nullable().describe('The pagination token to use in the next request to get older messages. Null if at the start of the history.'),
});
export type FetchMessagesOutput = z.infer<typeof FetchMessagesOutputSchema>;

const FetchMessagesFlowResultSchema = z.union([
  z.object({ success: z.literal(true), data: FetchMessagesOutputSchema }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export async function fetchMessages(input: FetchMessagesInput): Promise<FetchMessagesOutput> {
  const result = await fetchMessagesFlow(input);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}

const RANK_RESTRICTED_PREFIX = '[RANK_RESTRICTED]';

const fetchMessagesFlow = ai.defineFlow(
  {
    name: 'fetchMessagesFlow',
    inputSchema: FetchMessagesInputSchema,
    outputSchema: FetchMessagesFlowResultSchema,
  },
  async ({ from, limit, requestingUserRank }): Promise<FlowResult<FetchMessagesOutput>> => {
    try {
        const client = await getMatrixClient();
        const clanRoomId = env.MATRIX_CLAN_ROOM_ID;
        
        let room = client.getRoom(clanRoomId);
        if (!room) {
            const joinedRoom = await client.joinRoom(clanRoomId);
            room = client.getRoom(joinedRoom.room_id);
            if(!room) {
              throw new Error('Clan chat room not found and could not be joined.');
            }
        }

        const timeline = await client.scrollback(room, limit, from);
        
        if (!timeline) {
            return { success: true, data: { messages: [], nextFrom: null } };
        }

        const messages = await Promise.all(
            timeline.events
            .filter((event: any) => 
                (event.type === 'm.room.message' && event.content.msgtype === 'm.text' && event.content.body) ||
                (event.type === 'm.room.member')
            )
            .map(async (event: any) => {
                if (event.type === 'm.room.member') {
                    const senderName = event.content.displayname || event.sender.split(':')[0];
                    let eventContent = `@${senderName} updated their profile.`;
                    if (event.content.membership === 'join') {
                        eventContent = `@${senderName} logged in.`;
                    } else if (event.content.membership === 'leave') {
                        eventContent = `@${senderName} logged out.`;
                    }
                    return {
                        id: event.event_id,
                        type: 'event' as const,
                        sender: event.sender,
                        content: eventContent,
                        timestamp: event.origin_server_ts,
                    }
                }
                
                // Handle message visibility
                let messageContent = event.content.body;
                if (messageContent.startsWith(RANK_RESTRICTED_PREFIX)) {
                    // This is a rank-restricted message. Check permissions.
                    const senderId = event.sender.split(':')[0].replace('@', '') + '@elmiclan.com';
                    const senderRankResponse = await getUserRank({ userId: senderId });
                    
                    if (!senderRankResponse.rank || rankHierarchy[requestingUserRank] < rankHierarchy[senderRankResponse.rank]) {
                        // If the requesting user has a lower rank, hide the content.
                        messageContent = "[Message content hidden due to rank restrictions]";
                    } else {
                        // Otherwise, show the content but remove the prefix.
                        messageContent = messageContent.substring(RANK_RESTRICTED_PREFIX.length);
                    }
                }

                return {
                    id: event.event_id,
                    type: 'message' as const,
                    sender: event.sender,
                    content: messageContent,
                    timestamp: event.origin_server_ts,
                }
            })
        );
        
        return {
            success: true,
            data: {
                messages: messages.filter(Boolean) as any[], // Filter out any nulls from async ops
                nextFrom: timeline.end,
            }
        };

    } catch (e: any) {
        console.error('Matrix fetch failed:', e);
        return { 
            success: false, 
            error: e.message || 'An unknown error occurred during the Matrix operation.' 
        };
    }
  }
);
