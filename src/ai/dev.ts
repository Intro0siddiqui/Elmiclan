import { config } from 'dotenv';
config();

import '@/ai/flows/rank-advisor.ts';
import '@/ai/flows/set-custom-claim.ts';
import '@/ai/flows/validate-invite-code.ts';
import '@/ai/flows/send-secure-message.ts';
import '@/ai/flows/fetch-messages.ts';
