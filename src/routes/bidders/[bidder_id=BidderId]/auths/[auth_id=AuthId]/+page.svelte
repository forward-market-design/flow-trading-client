<script lang="ts">
	import type { PageProps } from './$types';
	import { API_URL, Api } from '$lib/api';
	import Outcomes from './Outcomes.svelte';
	import History from './History.svelte';
	import Portfolio from './Portfolio.svelte';
	import Record from './Record.svelte';
	import { PaginationAccumulator } from '$lib/api/pagination.svelte';
	import { onMount } from 'svelte';

	let { data }: PageProps = $props();

	const client = $derived(
		new Api(API_URL, fetch).asBidder(data.token, data.bidderId).asAuth(data.authId)
	);
	const outcomes = $derived(new PaginationAccumulator(data.outcomes, 'push'));
	const history = $derived(new PaginationAccumulator(data.history, 'push'));

	let streamOk = $state(false);
	onMount(async () => {
		streamOk = true;
		await client
			.streamOutcomes((data) => outcomes.results.unshift(data))
			.finally(() => (streamOk = false));
	});

	async function moreOutcomes() {
		if (outcomes.more) {
			await outcomes.accumulate(client.getOutcomes(outcomes.more));
		}
	}

	async function moreHistory() {
		if (history.more) {
			await history.accumulate(client.getHistory(history.more));
		}
	}
</script>

<form onsubmit={(event) => event.preventDefault()}>
	<input type="hidden" name="token" value={data.token} />
	{#await data.record}
		<h2 class="font-bold">Loading data...</h2>
	{:then record}
		<Record {record} {client} />
	{:catch err}
		<p>No matching auth found.</p>
	{/await}
</form>

{#await outcomes.initial}
	<section>
		<h2 class="font-bold">Loading outcomes...</h2>
	</section>
{:then}
	<Outcomes outcomes={outcomes.results}>
		<button
			class="btn"
			class:hidden={!outcomes.more}
			onclick={moreOutcomes}
			disabled={outcomes.loading}
		>
			Get more results
		</button>
	</Outcomes>
{:catch}
	<section>
		<h2>Error loading outcomes.</h2>
	</section>
{/await}

{#await data.record}
	<section>
		<h2 class="font-bold">Loading portfolio...</h2>
	</section>
{:then { portfolio }}
	<Portfolio portfolio={portfolio!} />
{:catch}
	<section>
		<h2 class="font-bold">Error loading portfolio.</h2>
	</section>
{/await}

{#await history.initial}
	<section>
		<h2 class="font-bold">Loading history...</h2>
	</section>
{:then}
	<History history={history.results}>
		<button
			class="btn text-xs"
			class:hidden={!history.more}
			onclick={moreHistory}
			disabled={history.loading}
		>
			Get more history
		</button>
	</History>
{:catch}
	<section>
		<h2 class="font-bold">Error loading outcomes.</h2>
	</section>
{/await}
