import { BidderId } from '$lib/api/types';
import { db } from '$lib/server/db';
import { parse } from 'valibot';

export async function load() {
	const bidders = await db.query.bidder
		.findMany()
		.then((bidders) => bidders.map(({ id, name }) => ({ id: parse(BidderId, id), name })));
	return { bidders };
}
