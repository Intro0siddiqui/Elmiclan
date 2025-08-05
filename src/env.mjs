import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    MATRIX_USER_ID: z.string().min(1),
    MATRIX_ACCESS_TOKEN: z.string().min(1),
    MATRIX_BASE_URL: z.string().url(),
    MATRIX_CLAN_ROOM_ID: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },
  runtimeEnv: {
    MATRIX_USER_ID: process.env.MATRIX_USER_ID,
    MATRIX_ACCESS_TOKEN: process.env.MATRIX_ACCESS_TOKEN,
    MATRIX_BASE_URL: process.env.MATRIX_BASE_URL,
    MATRIX_CLAN_ROOM_ID: process.env.MATRIX_CLAN_ROOM_ID,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
});
