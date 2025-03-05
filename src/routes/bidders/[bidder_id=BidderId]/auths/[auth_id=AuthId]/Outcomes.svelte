<script lang="ts">
	import type { AuthOutcome } from '$lib/api/types';
	import LineChart from '$lib/chart/LineChart.svelte';
	import type { Snippet } from 'svelte';

	let {
		outcomes,
		children
	}: {
		outcomes: AuthOutcome[];
		children?: Snippet<[]>;
	} = $props();
</script>

<section>
	<div class="flex items-start justify-between">
		<h2 class="font-bold">Auction Status</h2>
		{@render children?.()}
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
				{#snippet title()}
					<span class="font-bold">Portfolio Price</span>
				{/snippet}
			</LineChart>
		</div>
		<div class="mt-16 h-64 w-full p-8">
			<LineChart
				data={outcomes.toReversed().map(({ from, thru, trade }) => ({
					x: from,
					y: trade / ((thru.valueOf() - from.valueOf()) / 1000)
				}))}
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
				{#snippet title()}
					<span class="font-bold">Trade Rate (units/s)</span>
				{/snippet}
			</LineChart>
		</div>
	{:else}
		<p>No outcomes available.</p>
	{/if}
</section>
