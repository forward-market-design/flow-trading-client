/*
	SvelteKit encourages the use of streaming promises to fetch data in the
	load() functions. This is a awkward with paginated data, as there must be:
	* server-side fetch logic,
	* client-side fetch logic,
	* client-accumulation of server-pagination,
	* client-accumulation of client-pagination,
	* distinctions based on initial server promise and subsequent promises.
	
	The below function is an attempt at simplifying the setup. We do not tightly
	couple the implementation to any particular API call, so users must bring
	their own logic to passing subsequent requests, but there is an assumption
	that a paginated endpoint produces an array of `results` alongside a cursor
	query `more`.
*/

export class PaginationAccumulator<Result, More> {
	initial = Promise.resolve();
	results = $state([] as Result[]);
	more = $state(undefined as More | undefined);
	loading = $state(false);
	#mode = 'unshift' as 'unshift' | 'push';

	constructor(
		query: Promise<{ results: Result[]; more?: More }>,
		mode = 'unshift' as 'unshift' | 'push'
	) {
		this.initial = this.accumulate(query);
		this.#mode = mode;
	}

	accumulate(query: Promise<{ results: Result[]; more?: More }>) {
		this.loading = true;
		return query.then(({ results, more }) => {
			this.results[this.#mode](...results);
			this.more = more;
			this.loading = false;
		});
	}
}
