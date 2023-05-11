import type { Record } from './schemas';
import { updatedDNSRecordSchema, createdDNSRecord } from './schemas';
import { recordSchema } from './schemas';
import { retry, vercelAxios } from './utils';
import env from './env';
import { z } from 'zod';
import logger from './logger';

async function getPublicIp() {
	const res = await fetch('https://api.ipify.org');
	if (!res.ok) throw new Error(res.statusText);

	const data = await res.text();
	logger.info(data, 'Get Public Ip');
	return data;
}

async function getDNSRecords() {
	const res = await vercelAxios.get(`v4/domains/${env.domain}/records`);
	const records = z.array(recordSchema).parse(res.data.records);

	const filteredRecordsString = records
		.filter((r) => env.subdomains.includes(r.name))
		.map((r) => r.name)
		.join(', ');

	logger.info(filteredRecordsString, 'Get DNS Records');
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
	logger.info(newRecord.toString(), `Update DNS Record ${newRecord.name}`);
}

async function createDNSRecord(name: string, value: string) {
	const res = await vercelAxios.post(`v2/domains/${env.domain}/records`, {
		name: name,
		type: 'A',
		value: value,
		ttl: 60,
	});

	const record = createdDNSRecord.parse(res.data);
	logger.info(record.toString(), 'Create DNS Record');
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
		logger.error('Failed after 3 attempts, will try again in 30 min', 'Main');
	}
}

main();
setInterval(main, 1000 * 60 * 30); //30 min interval
