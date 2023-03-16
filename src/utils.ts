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

export function retry<T>(func: () => Promise<T>, attempt = 0): Promise<T> {
	return new Promise(
		(resolve) =>
			setTimeout(async () => {
				try {
					const value = await func();
					resolve(value);
				} catch (error) {
					console.error('ERROR:', func.name, 'attempt', attempt, '->', error);
					resolve(retry(func, attempt + 1));
				}
			}, 1000 * 10) //10 seconds
	);
}
