import { describe, expect, it } from 'vitest';
import { retry } from './utils';

describe('Retry async function logic', () => {
	function getValue(success = true) {
		return new Promise((resolve, reject) => (success ? resolve('SUCCESS') : reject('ERROR')));
	}

	it('Should return success on first try if success', async () => {
		const value = await retry(getValue);
		expect(value).toBe('SUCCESS');
	});

	it('Should return error if it fails 3 times', async () => {
		await expect(retry(() => getValue(false))).rejects.toEqual('ERROR');
	});
});
