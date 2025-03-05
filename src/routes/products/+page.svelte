<script lang="ts">
	import { enhance } from '$app/forms';
	import { Api, API_URL } from '$lib/api';
	import { PaginationAccumulator } from '$lib/api/pagination.svelte';
	import type { ProductRecord } from '$lib/api/types';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const fmt = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'short',
		timeStyle: 'short',
		timeZone: 'UTC'
	});

	function productSummary({ from, thru }: ProductRecord) {
		return fmt.formatRange(from, thru);
	}

	const client = new Api(API_URL, fetch);
	const productData = $derived(new PaginationAccumulator(data.products, 'push'));

	async function moreProducts() {
		if (productData.more) {
			await productData.accumulate(client.queryProducts(productData.more));
		}
	}
</script>

<div class="max-h-96 overflow-auto">
	{#await productData.initial}
		<p>Querying server...</p>
	{:then}
		{#if productData.results.length > 0}
			<ul class="flex flex-wrap justify-center gap-2 text-sm">
				{#each productData.results as product}
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
			{#if productData.more}
				<button class="btn" disabled={productData.loading} onclick={moreProducts}>Load more</button>
			{/if}
		{:else}
			<p>
				No products currently defined. Please use the form below to create some. (All times will be
				taken to be UTC+0.)
			</p>
		{/if}
	{:catch}
		<p>Unable to query server.</p>
	{/await}
</div>

<div>
	<form
		action="/admin/products"
		method="POST"
		use:enhance
		class="flex flex-wrap items-center justify-between gap-4 text-sm"
	>
		<label
			>From <input
				type="datetime-local"
				name="from"
				value="2030-01-01T00:00"
				class="input"
			/></label
		>
		<label
			>Thru <input
				type="datetime-local"
				name="thru"
				value="2030-02-01T00:00"
				class="input"
			/></label
		>
		<div class="flex items-center gap-2">
			<span>By</span>
			<input type="number" value="1" step="1" min="1" name="by" required class="input w-12" />
			<select name="unit" class="input">
				<option value="h">hour</option>
				<option value="d">day</option>
				<option value="m">month</option>
			</select>
		</div>
		<button type="submit" class="btn">Add Products</button>
	</form>
	<p class="mt-4 text-xs">
		Use this form to define new products to be used in bidding. This frontend is built around a <em
			>forward market</em
		>, thus the product definitions correspond to intervals of time.
	</p>
</div>
