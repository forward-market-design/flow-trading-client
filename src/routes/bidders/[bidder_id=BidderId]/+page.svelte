<script lang="ts">
	import { AuthRecord, CostRecord } from '$lib/api/types';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#snippet error(data: any)}
	<div class="bg-red-400">Error: {JSON.stringify(data)}</div>
{/snippet}

{#snippet auth({ bidder_id, auth_id, trade, version }: AuthRecord)}
	<tr>
		<th scope="row" class="px-2 font-mono font-normal"
			><a class="text-blue-600 hover:underline" href="{bidder_id}/auths/{auth_id}">{auth_id}</a></th
		>
		<td class="px-2 text-right font-mono">{trade?.toFixed(2)}</td>
		<td class="px-2">{version.toLocaleString()}</td>
	</tr>
{/snippet}

{#snippet cost({ bidder_id, cost_id, version }: CostRecord)}
	<tr>
		<th scope="row" class="px-2 font-mono font-normal"
			><a class="text-blue-600 hover:underline" href="{bidder_id}/costs/{cost_id}">{cost_id}</a></th
		>
		<td class="px-2">{version.toLocaleString()}</td>
	</tr>
{/snippet}

<section>
	<h2 class="flex flex-wrap items-center justify-between gap-4">
		{#await data.bidder}
			<span class="font-bold">Loading bidder data...</span>
		{:then bidder}
			<span class="font-bold">{bidder?.name ?? 'Unknown Bidder'}</span>
		{:catch error}
			<span class="font-bold text-red-600">Error Loading Bidder Data</span>
		{/await}
		<span class="text-xs">(As of {data.asOf.toLocaleString()})</span>
	</h2>
</section>

{#await data.submission}
	<section>
		<h2 class="font-bold">Loading data...</h2>
	</section>
{:then submission}
	<section>
		<h2 class="font-bold">Current Auths</h2>
		<table class="w-full border-separate border-spacing-2 text-center">
			<thead>
				<tr>
					<th>ID</th>
					<th>Traded</th>
					<th>Last Updated</th>
				</tr>
			</thead>
			<tbody>
				{#each submission.auths as record}
					{@render auth(record)}
				{/each}
				{#if submission.auths.length === 0}
					<tr class="text-center">
						<td>-</td>
						<td>-</td>
						<td>-</td>
					</tr>
				{/if}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="3">TODO: link for new auth</td>
				</tr>
			</tfoot>
		</table>
	</section>

	<section>
		<h2 class="font-bold">Current Costs</h2>
		<table class="w-full border-separate border-spacing-2 text-center">
			<thead>
				<tr>
					<th>ID</th>
					<th>Last Updated</th>
				</tr>
			</thead>
			<tbody>
				{#each submission.costs as record}
					{@render cost(record)}
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="2">TODO: link for new cost</td>
				</tr>
			</tfoot>
		</table>
	</section>
{:catch err}
	{@render error(err)}
{/await}
