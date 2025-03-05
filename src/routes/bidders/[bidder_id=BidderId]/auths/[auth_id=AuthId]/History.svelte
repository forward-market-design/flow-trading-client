<script lang="ts">
	import type { AuthHistoryRecord } from '$lib/api/types';
	import type { Snippet } from 'svelte';

	let {
		history,
		children
	}: {
		history: AuthHistoryRecord[];
		children?: Snippet<[]>;
	} = $props();
</script>

<details>
	<summary>
		<div class="inline-flex items-start justify-between gap-8">
			<h2 class="font-bold">History</h2>
			{@render children?.()}
		</div>
	</summary>

	<table class="border-separate border-spacing-2 text-right">
		<thead>
			<tr>
				<th class="px-2 text-center">Modified</th>
				<th class="px-2">Min Rate</th>
				<th class="px-2">Max Rate</th>
				<th class="px-2">Min Trade</th>
				<th class="px-2">Max Trade</th>
			</tr>
		</thead>
		<tbody>
			{#each history as item}
				<tr>
					<td class="px-2 text-center">{item.version.toLocaleString()}</td>
					{#if item.data}
						{@const { min_rate, max_rate, min_trade, max_trade } = item.data}
						<td class="px-2">{min_rate ?? '-'}</td>
						<td class="px-2">{max_rate ?? '-'}</td>
						<td class="px-2">{min_trade ?? '-'}</td>
						<td class="px-2">{max_trade ?? '-'}</td>
					{:else}
						<td class="px-2 text-center" colspan="4">N/A</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</details>
