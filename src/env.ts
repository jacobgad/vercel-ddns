import { z } from 'zod';

const envSchema = z.object({
	vercelApiKey: z.string(),
	domain: z.string(),
	subdomains: z.array(z.string()),
});

export const env = envSchema.parse({
	vercelApiKey: process.env.VERCEL_API_KEY,
	domain: process.env.DOMAIN,
	subdomains: process.env.SUBDOMAINS?.split(', '),
});
