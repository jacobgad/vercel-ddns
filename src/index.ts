import { env } from 'env';
import type { Record } from './types';

async function getPublicIp() {
	const res = await fetch('https://api.ipify.org');
	const data = await res.text();
	return data;
}

async function getDNSRecords() {
	try {
		const res = await fetch(`https://api.vercel.com/v4/domains/${env.domain}/records`, {
			headers: {
				Authorization: `Bearer ${env.vercelApiKey}`,
			},
			method: 'get',
		});

		const data = (await res.json()) as { records: Record[] };
		console.log('SUCCESS: getDNSRecords', data.records.map((r) => r.name).concat(', '));
		return data.records;
	} catch (error) {
		console.error('ERROR: getDNSRecords', error);
	}
}

async function updateDNSRecord(record: Record, publicIp: string) {
	try {
		const res = await fetch(`https://api.vercel.com/v1/domains/records/${record.id}`, {
			body: JSON.stringify({
				name: record.name,
				ttl: '60',
				type: 'A',
				value: publicIp,
			}),
			headers: {
				Authorization: `Bearer ${env.vercelApiKey}`,
				'Content-Type': 'application/json',
			},
			method: 'patch',
		});

		const data = (await res.json()) as Record;
		console.log('SUCCESS: updateDNSRecord', { name: data.name, value: data.value });
	} catch (error) {
		console.error('ERROR: updateDNSRecord', error);
	}
}

async function createDNSRecord(name: string, value: string) {
	try {
		const res = await fetch(`https://api.vercel.com/v2/domains/${env.domain}/records`, {
			body: JSON.stringify({
				name,
				type: 'A',
				ttl: 60,
				value,
			}),
			headers: {
				Authorization: `Bearer ${env.vercelApiKey}`,
				'Content-Type': 'application/json',
			},
			method: 'post',
		});

		const data = await res.json();
		console.log(data);
		console.log('SUCCESS: createDNSRecord', { name: data.name, value: data.value });
		return data;
	} catch (error) {
		console.error('ERROR: createDNSRecord', error);
	}
}

async function main() {
	const publicIp = await getPublicIp();
	console.log({ publicIp });

	const records = await getDNSRecords();

	env.subdomains.forEach(async (subdomain) => {
		const record = records?.find((record) => record.name === subdomain);
		if (!record) await createDNSRecord(subdomain, publicIp);
		if (record && record.value !== publicIp) updateDNSRecord(record, publicIp);
	});
}

main();
