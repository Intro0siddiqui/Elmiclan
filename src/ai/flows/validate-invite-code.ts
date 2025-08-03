'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { FlowResult } from '@/lib/types';

const ValidateInviteCodeInputSchema = z.object({
  inviteCode: z.string(),
});

const ValidateInviteCodeOutputSchema = z.object({
  isValid: z.boolean(),
});

const ValidateInviteCodeFlowResultSchema = z.union([
  z.object({ success: z.literal(true), data: ValidateInviteCodeOutputSchema }),
  z.object({ success: z.literal(false), error: z.string() }),
]);

export async function validateInviteCode(
  input: z.infer<typeof ValidateInviteCodeInputSchema>
): Promise<FlowResult<z.infer<typeof ValidateInviteCodeOutputSchema>>> {
  return validateInviteCodeFlow(input);
}

export const validateInviteCodeFlow = ai.defineFlow(
  {
    name: 'validateInviteCodeFlow',
    inputSchema: ValidateInviteCodeInputSchema,
    outputSchema: ValidateInviteCodeFlowResultSchema,
  },
  async ({ inviteCode }) => {
    // TODO: Implement database lookup
    if (['ELMI-2024', 'SCOUT-AHEAD', 'CONQUER'].includes(inviteCode.toUpperCase())) {
      return {
        success: true,
        data: { isValid: true },
      };
    }
    return {
      success: false,
      error: 'Invalid invite code.',
    };
  }
);
