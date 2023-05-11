import axios from 'axios';
import env from './env';
import logger from './logger';

export const vercelAxios = axios.create({
	baseURL: 'https://api.vercel.com/',
	timeout: 10000,
	headers: { Authorization: `Bearer ${env.vercelApiKey}` },
});

export function retry<T>(func: () => Promise<T>, maxAttempt = 3, currentAttempt = 1): Promise<T> {
	return new Promise(async (resolve, reject) => {
		try {
			const value = await func();
			resolve(value);
		} catch (error) {
			if (error instanceof Error) {
				logger.warning(error.message, `${func.name} Attempt ${currentAttempt}`);
			}
			if (currentAttempt >= maxAttempt) return reject(error);
			resolve(retry(func, maxAttempt, currentAttempt + 1));
		}
	});
}
