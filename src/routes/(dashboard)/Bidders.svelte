<script lang="ts">
	import type { BidderId } from '$lib/api/types';
	import Alert from '$lib/components/Alert.svelte';

	const { bidders }: { bidders: { id: BidderId; name: string }[] } = $props();
</script>

<section>
	<h2 class="mb-4 font-bold">Managed Bidders</h2>
	{#if bidders.length === 0}
		<Alert icon type="warning">Please import a dataset to get started.</Alert>
	{:else}
		<ul class="flex flex-wrap justify-center gap-2 text-sm">
			{#each bidders as { name, id }}
				<li class="contents">
					<a
						href="/bidders/{id}"
						class="flex flex-none items-center gap-2 rounded border-1 bg-white p-2 hover:bg-sky-100"
					>
						<span class="rounded bg-sky-700 p-2 text-xs font-bold text-white">{name}</span>
						<span class="w-[10ch] overflow-hidden overflow-ellipsis whitespace-pre">{id}</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>
