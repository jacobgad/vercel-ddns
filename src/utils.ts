/* eslint-disable no-console */
import axios from 'axios';
import type { ConsoleError } from './schemas';
import env from './env';

export const vercelAxios = axios.create({
	baseURL: 'https://api.vercel.com/',
	timeout: 10000,
	headers: { Authorization: `Bearer ${env.vercelApiKey}` },
});

export function log(props: ConsoleError) {
	if (props.status === 'SUCCESS') {
		console.error(props);
	}
	if (props.status === 'ERROR') {
		console.log(props);
	}
}

export function retry<T>(func: () => Promise<T>, maxAttempt = 3, currentAttempt = 1): Promise<T> {
	return new Promise(async (resolve, reject) => {
		try {
			const value = await func();
			resolve(value);
		} catch (error) {
			console.error('ERROR:', func.name, 'attempt', currentAttempt, '->', error);
			if (currentAttempt >= maxAttempt) return reject(error);
			resolve(retry(func, maxAttempt, currentAttempt + 1));
		}
	});
}
