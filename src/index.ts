import type { Record } from './types';
import env from './env';
import { log } from './utils';

async function getPublicIp() {
	try {
		const res = await fetch('https://api.ipify.org');
		const data = await res.text();
		log({ status: 'SUCCESS', function: 'getPublicIp', data });
		return data;
	} catch (error) {
		log({ status: 'ERROR', function: 'getPublicIp', error });
		throw 'Error retrieving public IP';
	}
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
		log({
			status: 'SUCCESS',
			function: 'getDNSRecords',
			data: data.records
				.filter((r) => env.subdomains.includes(r.name))
				.map((r) => r.name)
				.join(', '),
		});
		return data.records;
	} catch (error) {
		log({ status: 'ERROR', function: 'getDNSRecords', error });
	}
}

async function updateDNSRecord(record: Record, publicIp: string) {
	try {
		const res = await fetch(`https://api.vercel.com/v1/domains/records/${record.id}`, {
			body: JSON.stringify({
				name: record.name,
				ttl: 60,
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
		log({ status: 'SUCCESS', function: 'updateDNSRecord', record: data.name, data });
	} catch (error) {
		log({ status: 'ERROR', function: 'updateDNSRecord', record: record.name, error });
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
		log({ status: 'SUCCESS', function: 'createDNSRecord', data });
		return data;
	} catch (error) {
		log({ status: 'ERROR', function: 'createDNSRecord', record: name, error });
	}
}

async function main() {
	const publicIp = await getPublicIp();
	const records = await getDNSRecords();

	env.subdomains.forEach(async (subdomain) => {
		const record = records?.find((record) => record.name === subdomain);
		if (!record) await createDNSRecord(subdomain, publicIp);
		if (record && record.value !== publicIp) updateDNSRecord(record, publicIp);
	});
}

main();
setInterval(main, 1000 * 60 * 30); //30 min interval
