import { z } from "zod";

const envSchema = z.object({
  RAIDERIO_API_KEY: z.string().optional(),
  TTL: z.coerce.number().default(1000 * 60 * 15),
  MAX_CACHE_SIZE: z.coerce.number().default(1000),
  SYNC_INTERVAL_MS: z.coerce.number().default(1000 * 60 * 15),
  SYNC_ENABLED: z
    .string()
    .default("true")
    .transform((v) => v.toLowerCase() !== "false"),
  SYNC_PLAYER_DELAY_MS: z.coerce.number().default(200),
});

const env = envSchema.parse(process.env);

export const RAIDERIO_API_KEY = env.RAIDERIO_API_KEY;
export const TTL = env.TTL;
export const MAX_CACHE_SIZE = env.MAX_CACHE_SIZE;
export const SYNC_INTERVAL_MS = env.SYNC_INTERVAL_MS;
export const SYNC_ENABLED = env.SYNC_ENABLED;
export const SYNC_PLAYER_DELAY_MS = env.SYNC_PLAYER_DELAY_MS;

console.log(env);
