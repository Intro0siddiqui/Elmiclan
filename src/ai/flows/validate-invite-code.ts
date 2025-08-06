import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { FlowResult } from '@/lib/types';

export const validateInviteCodeFlow = defineFlow(
  {
    name: 'validateInviteCodeFlow',
    inputSchema: z.object({ inviteCode: z.string() }),
    outputSchema: z.union([
      z.object({ success: z.literal(true), data: z.object({ isValid: z.boolean(), rankId: z.number().optional() }) }),
      z.object({ success: z.literal(false), error: z.string() }),
    ]),
  },
  async ({ inviteCode }: { inviteCode: string }): Promise<FlowResult<{ isValid: boolean; rankId?: number }>> => {
    try {
      const { data, error } = await supabase
        .from('invites')
        .select('code, rank_id, uses_left')
        .eq('code', inviteCode)
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid invite code.' };
      }

      if (data.uses_left <= 0) {
        return { success: false, error: 'Invite code has no remaining uses.' };
      }

      const { error: updateError } = await supabase
        .from('invites')
        .update({ uses_left: data.uses_left - 1 })
        .eq('code', inviteCode);

      if (updateError) {
        console.error('Failed to update invite uses:', updateError);
        return { success: false, error: 'Failed to validate invite code.' };
      }

      return {
        success: true,
        data: {
          isValid: true,
          rankId: data.rank_id
        }
      };
    } catch (e: any) {
      console.error('Invite validation error:', e);
      return {
        success: false,
        error: e.message || 'An error occurred during invite validation.'
      };
    }
  }
);