import type { Record } from './schemas';
import { updatedDNSRecordSchema, createdDNSRecord } from './schemas';
import { recordSchema } from './schemas';
import { log, retry, vercelAxios } from './utils';
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
	const res = await vercelAxios.get(`v4/domains/${env.domain}/records`);
	const records = z.array(recordSchema).parse(res.data.records);

	log({
		status: 'SUCCESS',
		function: 'getDNSRecords',
		data: records
			.filter((r) => env.subdomains.includes(r.name))
			.map((r) => r.name)
			.join(', '),
	});
	return records;
}

async function updateDNSRecord(record: Record, publicIp: string) {
	const res = await vercelAxios.patch(`v1/domains/records/${record.id}`, {
		name: record.name,
		type: 'A',
		value: publicIp,
		ttl: 60,
	});

	const newRecord = updatedDNSRecordSchema.parse(res.data);
	log({
		status: 'SUCCESS',
		function: 'updateDNSRecord',
		record: newRecord.name,
		data: newRecord,
	});
}

async function createDNSRecord(name: string, value: string) {
	const res = await vercelAxios.post(`v2/domains/${env.domain}/records`, {
		name: name,
		type: 'A',
		value: value,
		ttl: 60,
	});

	const record = createdDNSRecord.parse(res.data);
	log({ status: 'SUCCESS', function: 'createDNSRecord', data: record });
	return record;
}

async function main() {
	try {
		const publicIp = await retry(getPublicIp);
		const records = await retry(getDNSRecords);

		env.subdomains.forEach(async (subdomain) => {
			const record = records?.find((record) => record.name === subdomain);
			if (!record) await retry(() => createDNSRecord(subdomain, publicIp));
			if (record && record.value !== publicIp) await retry(() => updateDNSRecord(record, publicIp));
		});
	} catch (error) {
		log({
			status: 'ERROR',
			function: 'main',
			error: 'Failed after 3 attempts, will try again in 30 min',
		});
	}
}

main();
setInterval(main, 1000 * 60 * 30); //30 min interval
