import { API_URL, Api } from '$lib/api';

export function load({ fetch, params }) {
	const client = new Api(API_URL, fetch).asProduct(params.product_id);
	return {
		id: params.product_id,
		record: client.getRecord(),
		outcomes: client.getOutcomes()
	};
}
