import logger from './logger';

export function formatSubdomain(string: string) {
	if (string === '') return 'ROOT';
	return string;
}

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
