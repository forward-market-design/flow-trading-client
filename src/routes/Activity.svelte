<script lang="ts">
	import { enhance } from '$app/forms';
	import ServerOn from '$lib/icons/Server.svelte';
	import ServerOff from '$lib/icons/ServerOffline.svelte';
	import type { AuctionOutcome } from '$lib/api/types';

	interface Props {
		data: null | AuctionOutcome;
		ok: boolean;
	}

	const { data, ok }: Props = $props();
	const cls = $derived(ok ? 'bg-green-300' : 'bg-red-300');
</script>

<div
	class="fixed top-0 left-0 w-full {cls} flex flex-wrap items-center justify-evenly gap-2 p-1 text-xs text-[0.5rem]"
>
	<div class="flex items-center gap-2">
		<div class="flex items-center gap-1 rounded bg-black/10 px-2 py-1">
			{#if !ok}
				<ServerOff />
			{:else}
				<ServerOn />
			{/if}
			<span>
				{data?.from.toLocaleTimeString() ?? 'N/A'}
			</span>
		</div>
		{#key data?.from}
			<span class="animate">New Outcomes Available</span>
		{/key}
	</div>
	<form method="POST" action="/admin/solve" class:hidden={!ok} use:enhance>
		<span
			title="Auctions are not automatically executed, but rather &quot;brought to real-time&quot via an explicit, privileged API call."
			class="px-1 font-bold">Batch Execution:</span
		>
		<div class="inline-flex items-center gap-2">
			<input type="number" value="1" step="1" min="1" name="by" required class="input w-12" />
			<select name="unit" class="input">
				<option value="s">sec</option>
				<option value="m">min</option>
				<option value="h">hour</option>
			</select>
			<span>Schedule</span>
			<button type="submit" name="freq" value="1" class="btn">1</button>
			<button type="submit" name="freq" value="2" class="btn">∞</button>
			<button type="submit" name="freq" value="0" class="btn">0</button>
		</div>
	</form>
</div>

<style>
	.animate {
		animation: 1s ease-in 0s pulse;
	}
	@keyframes pulse {
		0% {
			text-shadow: 0 0 1em currentColor;
		}
		100% {
			text-shadow: 0 0 0em transparent;
		}
	}
</style>
