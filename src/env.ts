/* eslint-disable no-console */
import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
	vercelApiKey: z.string(),
	domain: z.string(),
	subdomains: z.array(z.string()),
});

console.log('Domain', process.env.DOMAIN);
console.log('Subdomains', process.env.SUBDOMAINS?.split(', '));

const env = envSchema.parse({
	vercelApiKey: process.env.VERCEL_API_KEY,
	domain: process.env.DOMAIN,
	subdomains: process.env.SUBDOMAINS?.split(', '),
});

export default env;
