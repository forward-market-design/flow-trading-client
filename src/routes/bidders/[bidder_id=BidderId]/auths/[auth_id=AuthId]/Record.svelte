<script lang="ts">
	import type { AuthApi } from '$lib/api';
	import { AuthData, type AuthRecord } from '$lib/api/types';
	import Locked from '$lib/icons/Locked.svelte';
	import Unlocked from '$lib/icons/Unlocked.svelte';
	import { parse } from 'valibot';

	interface Props {
		record: AuthRecord;
		client: AuthApi;
	}

	const { record, client }: Props = $props();

	const authData = $state({
		min_rate: record.data?.min_rate ?? null,
		max_rate: record.data?.max_rate ?? null,
		min_trade: record.data?.min_trade ?? null,
		max_trade: record.data?.max_trade ?? null
	});

	$effect(() => void client.setData(parse(AuthData, authData)));
</script>

{#snippet slider(name: keyof typeof authData, min: number = -10, max: number = 10)}
	<div>
		{#if authData[name] === null}
			<button class="btn inline-flex gap-2" onclick={() => (authData[name] = 0.0)}
				><Unlocked />{name.slice(0, 3) === 'min' ? '-∞' : '∞'}</button
			>
		{:else}
			<button class="btn inline-flex gap-2" onclick={() => (authData[name] = null)}
				><Locked /> {authData[name]}</button
			><br />
			<input type="range" {name} {min} {max} step={(max - min) / 100} bind:value={authData[name]} />
		{/if}
	</div>
{/snippet}

<h2 class="flex flex-wrap items-center justify-between gap-4">
	<a href="/bidders/{record.bidder_id}/auths/{record.auth_id}" class="font-bold"
		>Auth Id = {record.auth_id}</a
	>
</h2>
<table class="border-separate border-spacing-2 text-center **:align-top">
	<thead>
		<tr>
			<th>Min Rate</th>
			<th>Max Rate</th>
			<th>Min Trade</th>
			<th>Max Trade</th>
		</tr>
	</thead>
	<tbody class="font-mono">
		<tr>
			{#if record.data}
				<td>{@render slider('min_rate', -10, 0)}</td>
				<td>{@render slider('max_rate', 0, 10)}</td>
				<td>{@render slider('min_trade', -10, 10)}</td>
				<td>{@render slider('max_trade', -10, 10)}</td>
			{:else}
				<td colspan="4">N/A</td>
			{/if}
		</tr>
	</tbody>
</table>
