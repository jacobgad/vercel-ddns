import type { ConsoleError } from './types';

export function log(props: ConsoleError) {
	if (props.status === 'SUCCESS') {
		/* eslint-disable no-console */
		console.error(props);
	}
	if (props.status === 'ERROR') {
		/* eslint-disable no-console */
		console.log(props);
	}
}
