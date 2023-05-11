import { z } from 'zod';
import * as dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const envSchema = z.object({
	vercelApiKey: z.string(),
	domain: z.string(),
	subdomains: z.array(z.string()),
});

const env = envSchema.parse({
	vercelApiKey: process.env.VERCEL_API_KEY,
	domain: process.env.DOMAIN,
	subdomains: process.env.SUBDOMAINS?.split(', '),
});

logger.debug(env.domain, 'Domain');
logger.debug(env.subdomains.toString(), 'Subdomains');

export default env;
