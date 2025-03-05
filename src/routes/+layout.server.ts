import { Api, API_URL } from '$lib/api';

export function load({ fetch }) {
	const client = new Api(API_URL, fetch);
	return {
		products: client.queryProducts()
	};
}
