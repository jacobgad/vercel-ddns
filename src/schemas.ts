import { z } from 'zod';

export type Record = z.infer<typeof recordSchema>;

const dnsRecordType = z.union([
	z.literal('A'),
	z.literal('AAAA'),
	z.literal('ALIAS'),
	z.literal('CAA'),
	z.literal('CNAME'),
	z.literal('MX'),
	z.literal('SRV'),
	z.literal('TXT'),
	z.literal('NS'),
]);

export const recordSchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	type: dnsRecordType,
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

export const updatedDNSRecordSchema = z.object({
	createdAt: z.number().nullable().optional(),
	creator: z.string(),
	domain: z.string(),
	id: z.string(),
	name: z.string(),
	recordType: dnsRecordType,
	ttl: z.number().optional(),
	type: z.union([z.literal('record'), z.literal('record-sys')]),
	value: z.string(),
});

export const createdDNSRecord = z.object({
	uid: z.string(),
	updated: z.number().optional(),
});
