'use server';

/**
 * @fileOverview Rank advancement AI agent.
 *
 * - rankAdvisor - A function that suggests paths to rank advancement.
 * - RankAdvisorInput - The input type for the rankAdvisor function.
 * - RankAdvisorOutput - The return type for the rankAdvisor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RankAdvisorInputSchema = z.object({
  currentRank: z.string().describe('The user\'s current rank.'),
  profileData: z.string().describe('The user\'s profile data, including skills, achievements, and activity.'),
});
export type RankAdvisorInput = z.infer<typeof RankAdvisorInputSchema>;

const RankAdvisorOutputSchema = z.object({
  recommendations: z.string().describe('Personalized recommendations for rank advancement.'),
});
export type RankAdvisorOutput = z.infer<typeof RankAdvisorOutputSchema>;

export async function rankAdvisor(input: RankAdvisorInput): Promise<RankAdvisorOutput> {
  return rankAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rankAdvisorPrompt',
  input: {schema: RankAdvisorInputSchema},
  output: {schema: RankAdvisorOutputSchema},
  prompt: `You are an expert advisor in the ElmiClan Portal, specializing in guiding users towards rank advancement.

  Based on the user's current rank and profile data, provide personalized recommendations for how they can advance to the next rank.

Current Rank: {{{currentRank}}}
Profile Data: {{{profileData}}}

Recommendations:`,
});

const rankAdvisorFlow = ai.defineFlow(
  {
    name: 'rankAdvisorFlow',
    inputSchema: RankAdvisorInputSchema,
    outputSchema: RankAdvisorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
