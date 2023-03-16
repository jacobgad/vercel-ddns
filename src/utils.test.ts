/* eslint-disable no-console */
import { retry } from './utils';

function getValue() {
	return new Promise<string>((resolve, reject) =>
		Math.random() < 0 ? resolve('SUCCESS') : reject('ERROR')
	);
}

async function printValue() {
	const value = await retry(getValue);
	console.log(value);
}

printValue();
