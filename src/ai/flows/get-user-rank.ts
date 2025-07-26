'use server';
/**
 * @fileOverview A flow for securely retrieving a user's rank.
 *
 * This flow simulates looking up a user's rank from a secure data source
 * on the backend, using their ID (email in this case).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Rank } from '@/lib/types';
import { MOCK_USERS } from '@/hooks/use-auth';

const GetUserRankInputSchema = z.object({
  userId: z.string().describe('The email/ID of the user to look up.'),
});
export type GetUserRankInput = z.infer<typeof GetUserRankInputSchema>;

const GetUserRankOutputSchema = z.object({
  rank: z.string().nullable().describe("The user's rank, or null if not found."),
});
export type GetUserRankOutput = z.infer<typeof GetUserRankOutputSchema>;

export async function getUserRank(input: GetUserRankInput): Promise<GetUserRankOutput> {
  return getUserRankFlow(input);
}

const getUserRankFlow = ai.defineFlow(
  {
    name: 'getUserRankFlow',
    inputSchema: GetUserRankInputSchema,
    outputSchema: GetUserRankOutputSchema,
  },
  async ({ userId }) => {
    // In a real application, this would fetch from a database.
    // Here, we use the mock user data.
    const user = MOCK_USERS[userId.toLowerCase()];
    
    if (user) {
      return {
        rank: user.rank,
      };
    }

    return {
      rank: null,
    };
  }
);
