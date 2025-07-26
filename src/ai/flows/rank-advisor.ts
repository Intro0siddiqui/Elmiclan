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
  recommendations: z.string().describe('Personalized recommendations for rank advancement, formatted as Markdown.'),
});
export type RankAdvisorOutput = z.infer<typeof RankAdvisorOutputSchema>;

export async function rankAdvisor(input: RankAdvisorInput): Promise<RankAdvisorOutput> {
  return rankAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rankAdvisorPrompt',
  input: {schema: RankAdvisorInputSchema},
  output: {schema: RankAdvisorOutputSchema},
  prompt: `You are the ElmiClan Rank Advisor, a wise and encouraging mentor. Your role is to provide clear, actionable guidance to members seeking to advance.

Your response MUST be formatted in Markdown. Use headings, bold text, and bullet points to make the advice easy to read.

Analyze the user's profile and provide personalized recommendations for advancement from their current rank.

**User Profile:**
- **Current Rank:** {{{currentRank}}}
- **Profile Summary:** {{{profileData}}}

**Your Task:**
Based on their rank and profile, provide a set of recommendations.

- If they are an **Errante**, guide them on how to become a Scout. Focus on exploration, basic skills, and completing introductory tasks.
- If they are a **Scout**, guide them on how to become a Conquistador. Focus on leadership potential, contributing significant intelligence, and participating in group activities.
- If they are a **Conquistador**, guide them on how to become an Admin (a rare and prestigious path). Focus on mentorship, strategic contributions, and demonstrating deep commitment to the clan's values.
- If they are an **Admin**, congratulate them on reaching the pinnacle and suggest ways they can mentor others and shape the future of the clan.

Begin your response with a title like "### Your Path to [Next Rank]".
`,
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
