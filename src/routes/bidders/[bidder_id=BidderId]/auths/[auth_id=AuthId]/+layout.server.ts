import { API_URL, Api } from '$lib/api';

export async function load({ fetch, locals, params }) {
	const client = new Api(API_URL, fetch)
		.asBidder(locals.token!, params.bidder_id)
		.asAuth(params.auth_id);

	return {
		bidderId: params.bidder_id,
		authId: params.auth_id,
		record: client.getRecord({ portfolio: 'include' }),
		history: client.getHistory(),
		outcomes: client.getOutcomes(),
		asOf: new Date()
	};
}
