import type { Record } from './schemas';
import { recordSchema } from './schemas';
import { log, retry } from './utils';
import env from './env';
import { z } from 'zod';

async function getPublicIp() {
	const res = await fetch('https://api.ipify.org');
	if (!res.ok) throw new Error(res.statusText);

	const data = await res.text();
	log({ status: 'SUCCESS', function: 'getPublicIp', data });
	return data;
}

async function getDNSRecords() {
	const res = await fetch(`https://api.vercel.com/v4/domains/${env.domain}/records`, {
		headers: {
			Authorization: `Bearer ${env.vercelApiKey}`,
		},
		method: 'get',
	});
	if (!res.ok) throw new Error(res.statusText);

	const data = await res.json();
	const records = z.array(recordSchema).parse(data.records);

	log({
		status: 'SUCCESS',
		function: 'getDNSRecords',
		data: records
			.filter((r) => env.subdomains.includes(r.name))
			.map((r) => r.name)
			.join(', '),
	});
	log({ status: 'SUCCESS', function: 'getDNSRecords', record: data.name, data });
	return records;
}

async function updateDNSRecord(record: Record, publicIp: string) {
	const res = await fetch(`https://api.vercel.com/v1/domains/records/${record.id}`, {
		body: JSON.stringify({
			name: record.name,
			type: 'A',
			value: publicIp,
			ttl: 60,
		}),
		headers: {
			Authorization: `Bearer ${env.vercelApiKey}`,
			'Content-Type': 'application/json',
		},
		method: 'patch',
	});
	if (!res.ok) throw new Error(res.statusText);

	const data = recordSchema.parse(await res.json());
	log({ status: 'SUCCESS', function: 'updateDNSRecord', record: data.name, data });
}

async function createDNSRecord(name: string, value: string) {
	const res = await fetch(`https://api.vercel.com/v2/domains/${env.domain}/records`, {
		body: JSON.stringify({
			name,
			type: 'A',
			value,
			ttl: 60,
		}),
		headers: {
			Authorization: `Bearer ${env.vercelApiKey}`,
			'Content-Type': 'application/json',
		},
		method: 'post',
	});
	if (!res.ok) throw new Error(res.statusText);

	const data = await res.json();
	log({ status: 'SUCCESS', function: 'createDNSRecord', data });
	return data;
}

async function main() {
	const publicIp = await retry(getPublicIp);
	const records = await retry(getDNSRecords);

	env.subdomains.forEach(async (subdomain) => {
		const record = records?.find((record) => record.name === subdomain);
		if (!record) await retry(() => createDNSRecord(subdomain, publicIp));
		if (record && record.value !== publicIp) await retry(() => updateDNSRecord(record, publicIp));
	});
}

main();
setInterval(main, 1000 * 60 * 30); //30 min interval
