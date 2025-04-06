import { fetchEventSource, type EventSourceMessage } from '@microsoft/fetch-event-source';
import { array, safeParse, type GenericSchema, type InferOutput } from 'valibot';
import {
	AuctionOutcome,
	AuthData,
	AuthHistoryRecord,
	AuthOutcome,
	AuthQueryParams,
	AuthRecord,
	CostData,
	CostHistoryRecord,
	CostQueryParams,
	CostRecord,
	DateTimePagination,
	DateTimeQuery,
	Group,
	Portfolio,
	ProductData,
	ProductId,
	ProductOutcome,
	ProductPagination,
	ProductRecord,
	SubmissionOutcome,
	type AuthId,
	type BidderId,
	type CostId,
	type ProductQuery
} from './types';
import { SubmissionRecord } from './types/submission';

/**
 * The base Api class.
 *
 * To build an API client, begin by initializing an `Api` instance. To
 * specialize on admin- or bidder-functionality, call either `asAdmin` or
 * `asBidder` with the appropriate arguments.
 */
export class Api {
	/**
	 * The base URL for the API server
	 */
	readonly url: URL;

	/**
	 * The fetch implementation to use for requests
	 */
	readonly fetch: (typeof globalThis)['fetch'];

	/**
	 * Create an instance of Api with the provided API url and (optional) fetch function.
	 */
	constructor(url: URL, fetch = globalThis['fetch']) {
		this.url = url;
		this.fetch = fetch;
	}

	/**
	 * Retrieves matching products known to the API
	 */
	queryProducts(query?: ProductQuery) {
		return this.$request(this.$url('/v0/products', query), 'GET').then((response) =>
			Api.$parse(response, ProductPagination)
		);
	}

	/**
	 * Retrieves the specific product
	 */
	asProduct(product: ProductId) {
		return new ProductApi(product, this);
	}

	/**
	 * Sets the bidder context for the API actions
	 */
	asBidder(token: string, bidderId: BidderId) {
		return new BidderApi(token, bidderId, this);
	}

	/**
	 * Sets the admin context for API actions
	 */
	asAdmin(token: string) {
		return new AdminApi(token, this);
	}

	/**
	 * Stream outcomes from the API server, executing the provided callback for
	 * each message.
	 */
	streamOutcomes(callback: (data: AuctionOutcome) => void) {
		return this.$stream(`/v0/outcomes`, AuctionOutcome, callback);
	}

	/**
	 * Internal method to construct URLs
	 */
	protected $url(path: string, query?: Record<string, any>) {
		const url = new URL(path, this.url);
		for (const [key, value] of Object.entries(query ?? {})) {
			if (value !== null && value !== undefined) {
				if (value.constructor === Date) {
					url.searchParams.set(key, value.toISOString());
				} else {
					url.searchParams.set(key, value.toString());
				}
			}
		}
		return url;
	}

	/**
	 * Internal method for executing fetch requests
	 */
	protected $request(
		this: Api & { readonly token?: string },
		url: URL,
		method: 'DELETE' | 'GET' | 'POST' | 'PUT',
		data?: any
	) {
		const headers = new Headers();
		this.token && headers.set('Authorization', `Bearer ${this.token}`);

		let body: string | null = null;

		if (data) {
			headers.set('Content-Type', 'application/json');
			body = JSON.stringify(data);
		}

		return this.fetch(
			new Request(url, {
				method,
				headers,
				body
			})
		);
	}

	/**
	 * Internal method for executing stream requests
	 */
	protected $stream<TSchema extends GenericSchema>(
		this: Api & { readonly token?: string },
		path: string,
		schema: TSchema,
		onmessage: (data: InferOutput<TSchema>) => void
	) {
		const url = new URL(path, this.url).toString();

		return fetchEventSource(url, {
			fetch: this.fetch,
			method: 'GET',
			headers: this.token
				? {
						Authorization: `Bearer ${this.token}`
					}
				: {},
			onmessage({ data }: EventSourceMessage) {
				const { success, output, issues } = safeParse(schema, JSON.parse(data));
				if (success) {
					onmessage(output);
				} else {
					throw { type: 'parse', issues };
				}
			}
		});
	}

	/**
	 * Internal helper method to robustly consume a fetch response and parse its
	 * body (json or text) with the provided Valibot schema.
	 */
	protected static async $parse<TSchema extends GenericSchema>(
		response: Response,
		schema: TSchema
	) {
		if (response.ok) {
			let data: unknown = null;
			try {
				data = await response.json();
			} catch (error) {
				throw { type: 'response', error };
			}
			const { success, output, issues } = safeParse(schema, data);
			if (success) {
				return output;
			} else {
				throw { type: 'parse', issues };
			}
		} else {
			throw { type: 'api', response };
		}
	}
}

/**
 * The product-related API actions
 */
export class ProductApi extends Api {
	product: ProductId;

	constructor(product: ProductId, from: Api) {
		super(from.url, from.fetch);
		this.product = product;
	}

	/**
	 * Retrieves the specific product
	 */
	getRecord() {
		return this.$request(this.$url(`/v0/products/${this.product}`), 'GET').then((response) =>
			ProductApi.$parse(response, ProductRecord)
		);
	}

	/**
	 * Get the paginated outcomes for the product
	 */
	getOutcomes(more?: DateTimeQuery) {
		return this.$request(
			this.$url(`/v0/products/${this.product}/outcomes`, {
				before: more?.before,
				after: more?.after
			}),
			'GET'
		).then((response) => ProductApi.$parse(response, DateTimePagination(ProductOutcome)));
	}

	/**
	 * Stream outcomes from the API server, executing the provided callback for
	 * each message.
	 */
	streamOutcomes(callback: (data: ProductOutcome) => void) {
		return this.$stream(`/v0/outcomes/products/${this.product}`, ProductOutcome, callback);
	}
}

/**
 * The admin-related API actions
 */
export class AdminApi extends Api {
	/**
	 * The token, if any, to attach to requests
	 */
	readonly token: string;

	constructor(token: string, from: Api) {
		super(from.url, from.fetch);
		this.token = token;
	}

	/**
	 * Define new products
	 */
	defineProducts(products: ProductData[]) {
		return this.$request(this.$url('/admin/products'), 'POST', products).then((response) =>
			AdminApi.$parse(response, array(ProductId))
		);
	}

	/**
	 * Solves any outstanding batches
	 */
	solveBatches(by: string | null, thru = new Date()) {
		return this.$request(this.$url('/admin/auctions/solve'), 'POST', {
			by,
			thru
		}).then((response) =>
			response.ok ? Promise.resolve(null) : Promise.reject({ type: 'api', response } as const)
		);
	}
}

/**
 * The bidder-related API actions
 */
export class BidderApi extends Api {
	readonly token: string;
	readonly bidder: BidderId;

	constructor(token: string, bidder: BidderId, from: Api) {
		super(from.url, from.fetch);
		this.bidder = bidder;
		this.token = token;
	}

	/**
	 * Create a new auth.
	 */
	createAuth(body: { auth_id?: AuthId; portfolio: Portfolio; data: AuthData }) {
		return this.$request(this.$url(`/v0/auths`), 'POST', body).then((response) =>
			BidderApi.$parse(response, AuthRecord)
		);
	}

	/**
	 * Create a new cost.
	 */
	createCost(group: Group, data: CostData) {
		return this.$request(this.$url(`/v0/costs`), 'POST', { group, data }).then((response) =>
			BidderApi.$parse(response, CostRecord)
		);
	}

	/**
	 * Retrieve the current submission
	 */
	getSubmission() {
		return this.$request(this.$url(`/v0/submissions/${this.bidder}`), 'GET').then((response) =>
			BidderApi.$parse(response, SubmissionRecord)
		);
	}

	/**
	 * Set the current submission
	 */
	setSubmission(
		auths: (
			| { auth_id: AuthId }
			| { auth_id: AuthId; data: AuthData }
			| { auth_id: AuthId; portfolio: Portfolio; data: AuthData }
		)[],
		costs: (
			| { cost_id: CostId }
			| { cost_id: CostId; data: CostData }
			| { cost_id: CostId; group: Group; data: CostData }
		)[]
	) {
		return this.$request(this.$url(`/v0/submissions/${this.bidder}`), 'PUT', { auths, costs }).then(
			(response) => BidderApi.$parse(response, SubmissionRecord)
		);
	}

	/**
	 * Stops the current submission
	 */
	stopSubmission() {
		return this.$request(this.$url(`/v0/submissions/${this.bidder}`), 'DELETE').then((response) =>
			BidderApi.$parse(response, SubmissionRecord)
		);
	}

	/**
	 * Adds (or replaces) the auth context for the API actions
	 */
	asAuth(auth: AuthId) {
		return new AuthApi(auth, this);
	}

	/**
	 * Adds (or replaces) the cost context for the API actions
	 */
	asCost(cost: CostId) {
		return new CostApi(cost, this);
	}

	/**
	 * Stream outcomes from the API server, executing the provided callback for
	 * each message.
	 */
	streamOutcomes(callback: (data: SubmissionOutcome) => void) {
		return this.$stream(`/v0/outcomes/bidders/${this.bidder}`, SubmissionOutcome, callback);
	}
}

/**
 * The auth-related API actions
 */
export class AuthApi extends BidderApi {
	auth: AuthId;

	constructor(auth: AuthId, from: BidderApi) {
		super(from.token, from.bidder, from);
		this.auth = auth;
	}

	/**
	 * Get the current record for the authorization
	 */
	getRecord(query?: AuthQueryParams) {
		return this.$request(this.$url(`/v0/auths/${this.auth}`, query), 'GET').then((response) =>
			AuthApi.$parse(response, AuthRecord)
		);
	}

	/**
	 * Update the current record for the authorization.
	 */
	setData(data: AuthData, query?: AuthQueryParams) {
		return this.$request(this.$url(`/v0/auths/${this.auth}`, query), 'PUT', { data }).then(
			(response) => AuthApi.$parse(response, AuthRecord)
		);
	}

	/**
	 * Make the authorization inactive / stop all trade associated to this
	 * authorization.
	 * TODO: propagate the query params
	 */
	stop(query?: AuthQueryParams) {
		return this.$request(this.$url(`/v0/auths/${this.auth}`, query), 'DELETE').then((response) =>
			AuthApi.$parse(response, AuthRecord)
		);
	}

	/**
	 * Get the paginated history of authorizations for the portfolio
	 */
	getHistory(more?: DateTimeQuery) {
		return this.$request(this.$url(`/v0/auths/${this.auth}/history`, more), 'GET').then(
			(response) => AuthApi.$parse(response, DateTimePagination(AuthHistoryRecord))
		);
	}

	/**
	 * Get the paginated outcomes for the authorization
	 */
	getOutcomes(more?: DateTimeQuery) {
		return this.$request(this.$url(`/v0/auths/${this.auth}/outcomes`, more), 'GET').then(
			(response) => AuthApi.$parse(response, DateTimePagination(AuthOutcome))
		);
	}
}

/**
 * The cost-related API actions
 */
export class CostApi extends BidderApi {
	cost: CostId;

	constructor(cost: CostId, from: BidderApi) {
		super(from.token, from.bidder, from);
		this.cost = cost;
	}

	/**
	 * Get the current authorization associated to the portfolio
	 */
	getRecord(query?: CostQueryParams) {
		return this.$request(this.$url(`/v0/costs/${this.cost}`, query), 'GET').then((response) =>
			CostApi.$parse(response, CostRecord)
		);
	}

	/**
	 * Update the current record for the cost
	 */
	setData(data: CostData, query?: CostQueryParams) {
		return this.$request(this.$url(`/v0/costs/${this.cost}`, query), 'PUT', { data }).then(
			(response) => CostApi.$parse(response, CostRecord)
		);
	}

	/**
	 * Zero the cost / remove it from calculations.
	 */
	stop(query?: CostQueryParams) {
		return this.$request(this.$url(`/v0/costs/${this.cost}`, query), 'DELETE').then((response) =>
			CostApi.$parse(response, CostRecord)
		);
	}

	/**
	 * Get the paginated history of bids for the group
	 */
	getHistory(more?: DateTimeQuery) {
		return this.$request(
			this.$url(`/v0/costs/${this.cost}/history`, {
				before: more?.before,
				after: more?.after
			}),
			'GET'
		).then((response) => CostApi.$parse(response, DateTimePagination(CostHistoryRecord)));
	}
}
