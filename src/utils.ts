/* eslint-disable no-console */
import type { ConsoleError } from './schemas';

export function log(props: ConsoleError) {
	if (props.status === 'SUCCESS') {
		console.error(props);
	}
	if (props.status === 'ERROR') {
		console.log(props);
	}
}

export function retry<T>(func: () => Promise<T>, attempt = 0): Promise<T> {
	return new Promise((resolve) =>
		setTimeout(async () => {
			try {
				const value = await func();
				resolve(value);
			} catch (error) {
				console.error('ERROR: attempt', attempt, '->', func.name, error);
				resolve(retry(func, attempt + 1));
			}
		}, 1000 * 10)
	);
}
