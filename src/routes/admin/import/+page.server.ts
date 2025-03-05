import { AdminApi, Api, API_URL } from '$lib/api';
import {
	AuthData,
	AuthId,
	BidderId,
	CostData,
	Group,
	Portfolio,
	ProductData,
	type ProductId
} from '$lib/api/types';
import { token } from '$lib/server/api';
import { db } from '$lib/server/db';
import { bidder } from '$lib/server/schema';
import { fail } from '@sveltejs/kit';
import { parse } from 'valibot';
import simpleData from '../../../data/simple.json';

export const actions = {
	default: async ({ fetch, locals, request }) => {
		const formData = await request.formData();
		const dataset = formData.get('data') as string;
		let data;
		switch (dataset) {
			case 'simple':
				data = simpleData;
				break;
			default:
				return fail(400, { unknown: dataset });
		}

		const client = new Api(API_URL, fetch).asAdmin(locals.token!);

		await importSetup(client, data);
		return { success: true };
	}
};

async function importSetup(adminClient: AdminApi, data: any) {
	// Define the products we will be using -- this requires admin access
	const productNames = Object.keys(data.products);
	const productIds = await adminClient.defineProducts(
		Object.values(data.products).map((product) => parse(ProductData, product))
	);
	const products: Map<string, ProductId> = new Map();
	for (let i = 0; i < productNames.length; i++) {
		products.set(productNames[i], productIds[i]);
	}

	// Now start creating users
	for (const [bidderName, submission] of Object.entries(data.bidders)) {
		const bidderId = parse(BidderId, crypto.randomUUID());
		const bidderToken = await token(bidderId, false);
		const bidderClient = adminClient.asBidder(bidderToken, bidderId);

		// We're going to store the (name, id) locally, so that we can easily revisit their bids
		await db.insert(bidder).values({ id: bidderId, name: bidderName });

		// Now we parse out their submission

		// First, we define the auths and maintain the (name, id) associations
		const auths: Map<string, AuthId> = new Map();

		for (const [authName, { portfolio, data }] of Object.entries((submission as any).auths) as [
			string,
			any
		][]) {
			// Remap the portfolio in terms of the new products
			const authPortfolio = parse(
				Portfolio,
				Object.fromEntries(
					Object.entries(portfolio).map(([key, value]) => [products.get(key)!, value])
				)
			);

			// Validate the data
			const authData = parse(AuthData, data);

			// Define the auth and associate the id to the name
			const authRecord = await bidderClient.createAuth({
				portfolio: authPortfolio,
				data: authData
			});
			auths.set(authName, authRecord.auth_id);
		}

		for (const { group, data } of (submission as any).costs) {
			// Remap the group in terms of the auths
			const costGroup = parse(
				Group,
				Object.fromEntries(Object.entries(group).map(([key, value]) => [auths.get(key)!, value]))
			);

			// Validate the data
			const costData = parse(CostData, data);

			// Define the cost and remember its id
			await bidderClient.createCost(costGroup, costData);
		}
	}
}
