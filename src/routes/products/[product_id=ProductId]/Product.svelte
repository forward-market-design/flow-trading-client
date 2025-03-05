<script lang="ts">
	import type { ProductOutcome, ProductRecord } from '$lib/api/types';
	import type { Snippet } from 'svelte';
	import LineChart from '../../../lib/chart/LineChart.svelte';

	interface Props {
		product: ProductRecord;
		outcomes: ProductOutcome[];
		children?: Snippet;
	}

	let { product, outcomes, children }: Props = $props();

	const fmt = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'short',
		timeStyle: 'short'
	});

	const summary = fmt.formatRange(product.from, product.thru);
</script>

<div>
	<div class="flex items-start justify-between">
		<h4>
			<span>{product.kind}</span>
			<span>{summary}</span>
		</h4>
		<div>
			{@render children?.()}
		</div>
	</div>
	{#if outcomes.length > 0}
		<div class="h-64 w-full p-8">
			<LineChart
				data={outcomes.toReversed().map(({ from, price }) => ({ x: from, y: price }))}
				x={[(x) => x.valueOf(), (ms) => new Date(ms)]}
				xmin={outcomes.at(-1)!.from}
			>
				{#snippet xfmt(value: Date)}
					<div class="w-min text-center">
						{new Date(value).toISOString().split('T').join(' ')}
					</div>
				{/snippet}
				{#snippet yfmt(value: number)}
					<div>{value.toFixed(2)}</div>
				{/snippet}
			</LineChart>
		</div>
		<div class="mt-16 h-64 w-full p-8">
			<LineChart
				data={outcomes.toReversed().map(({ from, trade }) => ({ x: from, y: trade }))}
				x={[(x) => x.valueOf(), (ms) => new Date(ms)]}
				xmin={outcomes.at(-1)!.from}
			>
				{#snippet xfmt(value: Date)}
					<div class="w-min text-center">
						{new Date(value).toISOString().split('T').join(' ')}
					</div>
				{/snippet}
				{#snippet yfmt(value: number)}
					<div>{value.toFixed(2)}</div>
				{/snippet}
			</LineChart>
		</div>
	{:else}
		<p>No outcomes available.</p>
	{/if}
</div>
