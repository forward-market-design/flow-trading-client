<script lang="ts">
	import Product from './Product.svelte';
	import { Api, API_URL } from '$lib/api';
	import { PaginationAccumulator } from '$lib/api/pagination.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();

	const client = $derived(new Api(API_URL, fetch).asProduct(data.id));
	const outcome = $derived(new PaginationAccumulator(data.outcomes, 'push'));

	let streamOk = $state(false);
	onMount(async () => {
		streamOk = true;
		await client
			.streamOutcomes((data) => outcome.results.unshift(data))
			.finally(() => (streamOk = false));
	});

	async function moreOutcomes() {
		if (outcome.more) {
			await outcome.accumulate(client.getOutcomes(outcome.more));
		}
	}

	// TODO: some conditional rendering based on `streamOk`.
</script>

<div>
	{#await data.record}
		<p>Loading product data...</p>
	{:then product}
		{#if product}
			<Product {product} outcomes={outcome.results}>
				{#if outcome.more}
					<button class="btn" onclick={moreOutcomes} disabled={outcome.loading}>
						Get more results
					</button>
				{/if}
			</Product>
		{:else}
			<p>No product with that id found.</p>
		{/if}
	{:catch}
		<p>Error loading product data. Please reload and try again.</p>
	{/await}
</div>
