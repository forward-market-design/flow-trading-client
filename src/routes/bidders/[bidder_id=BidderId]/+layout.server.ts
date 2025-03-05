import { API_URL, Api } from '$lib/api';
import { db } from '$lib/server/db';

export async function load({ fetch, locals, params }) {
	const bidderId = params.bidder_id;
	const client = new Api(API_URL, fetch).asBidder(locals.token!, bidderId);
	const bidder = db.query.bidder.findFirst({
		where: (bidder, { eq }) => eq(bidder.id, bidderId)
	});

	return {
		asOf: new Date(),
		submission: client.getSubmission(),
		bidder: await bidder,
		token: locals.token!
	};
}
