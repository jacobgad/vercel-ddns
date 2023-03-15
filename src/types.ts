export type Record = {
	id: string;
	slug: string;
	name: string;
	type: 'A' | 'AAAA' | 'ALIAS' | 'CAA' | 'CNAME' | 'MX' | 'SRV' | 'TXT' | 'NS';
	value: string;
	mxPriority?: number;
	priority?: number;
	creator: string;
	created: number | null;
	updated: number | null;
	createdAt: number | null;
	updatedAt: number | null;
	ttl: number;
};

export type ConsoleError = {
	status: 'SUCCESS' | 'ERROR';
	function: string;
	record?: string;
	data?: unknown;
	error?: unknown;
};
