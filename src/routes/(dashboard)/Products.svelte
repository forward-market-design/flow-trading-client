<script lang="ts">
	import { API_URL, Api } from '$lib/api';
	import { PaginationAccumulator } from '$lib/api/pagination.svelte';
	import { ProductQuery, ProductRecord } from '$lib/api/types';
	import Alert from '$lib/components/Alert.svelte';

	const { data }: { data: PaginationAccumulator<ProductRecord, ProductQuery> } = $props();
	const client = new Api(API_URL, fetch);

	async function moreProducts() {
		if (data.more) {
			await data.accumulate(client.queryProducts(data.more));
		}
	}

	const fmt = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'short',
		timeStyle: 'short',
		timeZone: 'UTC'
	});

	function productSummary({ from, thru }: ProductRecord) {
		return fmt.formatRange(from, thru);
	}
</script>

<section>
	<h2 class="mb-4 font-bold">Products</h2>
	{#await data.initial}
		Loading products...
	{:then}
		{#if data.results.length === 0}
			<Alert icon type="warning">
				No products are currently defined. Import a dataset or
				<a href="/products">define products</a> to continue.
			</Alert>
		{:else}
			<ul class="flex flex-wrap justify-center gap-2 text-sm">
				{#each data.results as product}
					<li class="contents">
						<a
							href="/products/{product.id}"
							class="flex flex-none items-center gap-2 rounded border-1 bg-white p-2 hover:bg-sky-100"
						>
							<span class="rounded bg-sky-700 p-2 text-xs font-bold text-white">{product.kind}</span
							>
							<span>{productSummary(product)}</span>
						</a>
					</li>
				{/each}
			</ul>
			{#if data.more}
				<button class="btn" disabled={data.loading} onclick={moreProducts}>Load more</button>
			{/if}
		{/if}
	{:catch err}
		<Alert icon type="danger">Unable to load products.</Alert>
		{@debug err}
	{/await}
</section>
