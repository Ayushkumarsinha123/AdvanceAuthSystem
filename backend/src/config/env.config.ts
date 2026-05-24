import dotenv from 'dotenv';
import {z} from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default(4000),
  DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a completely valid database connection string" }),
  SALT_ROUNDS: z.string().transform((val) => parseInt(val, 10)).default(12),
  
  // Advanced token configuration fields
  ACCESS_TOKEN_SECRET: z.string().min(32, { message: "Access secret should be highly secure (at least 32 characters)" }),
  REFRESH_TOKEN_SECRET: z.string().min(32, { message: "Refresh secret should be highly secure (at least 32 characters)" }),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  
  // Main client routing target parameters
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});

// 3. Attempt parsing the active process context
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid Environment Configuration parameters detected:');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  
  // Instantly terminate execution line to prevent unpredictable runtime bugs
  process.exit(1);
}

export const env = _env.data;
export default env;