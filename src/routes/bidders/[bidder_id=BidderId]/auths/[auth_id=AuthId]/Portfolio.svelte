<script lang="ts">
	import type { Portfolio, ProductId } from '$lib/api/types';

	let { portfolio }: { portfolio: Portfolio } = $props();

	// We have a promise corresponding to the portfolio entries, so we deal with that.
	const entries = $derived.by(() => {
		const entries = Object.entries(portfolio) as [ProductId, number][];
		entries.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
		return entries;
	});
</script>

<details>
	<summary>
		<h2 class="inline font-bold">Portfolio Definition</h2>
	</summary>

	<table class="border-separate border-spacing-2 text-center">
		<thead>
			<tr>
				<th class="px-2">Product</th>
				<th class="px-2">Weight</th>
			</tr>
		</thead>
		<tbody>
			{#each entries as [product, weight]}
				<tr>
					<td class="px-2">
						<a class="text-blue-600 hover:underline" href="/products/{product}">{product}</a>
					</td>
					<td class="px-2">{weight}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</details>
