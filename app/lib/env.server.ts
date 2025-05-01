import { z } from "zod";

const envSchema = z.object({
  RAIDERIO_API_KEY: z.string().optional(),
  TTL: z.coerce.number().default(1000 * 60 * 15),
  MAX_CACHE_SIZE: z.coerce.number().default(1000),
});

const env = envSchema.parse(process.env);

export const RAIDERIO_API_KEY = env.RAIDERIO_API_KEY;
export const TTL = env.TTL;
export const MAX_CACHE_SIZE = env.MAX_CACHE_SIZE;

console.log(env);
