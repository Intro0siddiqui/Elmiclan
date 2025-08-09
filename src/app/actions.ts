'use server';

import { validateInviteCodeFlow } from '@/ai/flows/validate-invite-code';
import { FlowResult } from '@/lib/types';

export async function validateInviteCodeAction(inviteCode: string): Promise<FlowResult<{ isValid: boolean; rankId?: number }>> {
  const result = await validateInviteCodeFlow.run({ inviteCode });
  return result;
}
