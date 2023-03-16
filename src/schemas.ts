import { z } from 'zod';

export type ConsoleError = z.infer<typeof consoleErrorSchema>;
export type Record = z.infer<typeof recordSchema>;

export const consoleErrorSchema = z.object({
	status: z.union([z.literal('SUCCESS'), z.literal('ERROR')]),
	function: z.string(),
	record: z.string().optional(),
	data: z.unknown().optional(),
	error: z.unknown().optional(),
});

export const recordSchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	type: z.union([
		z.literal('A'),
		z.literal('AAAA'),
		z.literal('ALIAS'),
		z.literal('CAA'),
		z.literal('CNAME'),
		z.literal('MX'),
		z.literal('SRV'),
		z.literal('TXT'),
		z.literal('NS'),
	]),
	value: z.string(),
	mxPriority: z.number().optional(),
	priority: z.number().optional(),
	creator: z.string(),
	created: z.number().nullable(),
	updated: z.number().nullable(),
	createdAt: z.number().nullable(),
	updatedAt: z.number().nullable(),
	ttl: z.number().min(60).max(2147483647).optional(),
});
