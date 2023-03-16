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
