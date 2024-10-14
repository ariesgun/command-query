import { StaticDecode, Type as T } from "@sinclair/typebox";

export const envSchema = T.Object({
  SUPABASE_URL: T.String(),
  SUPABASE_KEY: T.String(),
});

export type Env = StaticDecode<typeof envSchema>;
