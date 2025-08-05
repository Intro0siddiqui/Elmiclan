'use server';
/**
 * @fileOverview A flow for securely retrieving a user's rank from the database.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { supabase } from '@/lib/supabase';
import { FlowResult } from '@/lib/types';

const GetUserRankInputSchema = z.object({
  userId: z.string().describe('The email/ID of the user to look up.'),
});
export type GetUserRankInput = z.infer<typeof GetUserRankInputSchema>;

const GetUserRankOutputSchema = z.object({
  rank: z.string().nullable().describe("The user's rank name, or null if not found."),
});
export type GetUserRankOutput = z.infer<typeof GetUserRankOutputSchema>;

const GetUserRankFlowResultSchema = z.union([
  z.object({ success: z.literal(true), data: GetUserRankOutputSchema }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export async function getUserRank(input: GetUserRankInput): Promise<FlowResult<GetUserRankOutput>> {
  return getUserRankFlow(input);
}

const getUserRankFlow = ai.defineFlow(
  {
    name: 'getUserRankFlow',
    inputSchema: GetUserRankInputSchema,
    outputSchema: GetUserRankFlowResultSchema,
  },
  async ({ userId }) => {
    try {
      // Query user profile with joined rank data
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          rank:ranks (
            name
          )
        `)
        .eq('email', userId.toLowerCase())
        .single();

      if (error || !data) {
        return {
          success: false as const,
          error: 'User not found'
        };
      }

      // Extract rank name from joined data
      const rankName = data.rank?.name;

      return {
        success: true as const,
        data: {
          rank: rankName || null
        }
      };
    } catch (e: any) {
      console.error('Database query failed:', e);
      return {
        success: false as const,
        error: e.message || 'Failed to fetch user rank'
      };
    }
  }
);
