'use server';
/**
 * @fileOverview A flow for validating user invite codes.
 *
 * This is a placeholder for a secure backend operation. In a real implementation,
 * this would check a 'invites' collection in Firestore to see if a code
 * is valid, not expired, and hasn't exceeded its uses.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
// import { getFirestore } from 'firebase-admin/firestore'; // Example of a real import

const ValidateInviteCodeInputSchema = z.object({
  inviteCode: z.string().describe('The invite code to validate.'),
});
export type ValidateInviteCodeInput = z.infer<typeof ValidateInviteCodeInputSchema>;

const ValidateInviteCodeOutputSchema = z.object({
  isValid: z.boolean(),
  message: z.string(),
});
export type ValidateInviteCodeOutput = z.infer<typeof ValidateInviteCodeOutputSchema>;

export async function validateInviteCode(input: ValidateInviteCodeInput): Promise<ValidateInviteCodeOutput> {
  return validateInviteCodeFlow(input);
}

const validateInviteCodeFlow = ai.defineFlow(
  {
    name: 'validateInviteCodeFlow',
    inputSchema: ValidateInviteCodeInputSchema,
    outputSchema: ValidateInviteCodeOutputSchema,
  },
  async ({ inviteCode }) => {
    console.log(`Validating invite code: ${inviteCode}`);

    // In a real implementation, you would query your Firestore database here.
    // const db = getFirestore();
    // const inviteRef = db.collection('invites').doc(inviteCode);
    // const doc = await inviteRef.get();
    //
    // if (!doc.exists) {
    //   return { isValid: false, message: 'Invalid invite code.' };
    // }
    //
    // const data = doc.data();
    // if (data.uses >= data.maxUses) {
    //   return { isValid: false, message: 'Invite code has been fully used.' };
    // }

    // Using the same placeholder logic from the original signup page for now.
    const VALID_INVITE_CODES = ['ELMI-2024', 'SCOUT-AHEAD', 'CONQUER'];
    if (VALID_INVITE_CODES.includes(inviteCode.toUpperCase())) {
       return {
        isValid: true,
        message: 'Invite code is valid.',
      };
    }

    return {
      isValid: false,
      message: 'Invalid invite code.',
    };
  }
);
