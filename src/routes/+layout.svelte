<script lang="ts">
	import '../app.css';
	import Activity from './Activity.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { Api, API_URL } from '$lib/api';
	import type { AuctionOutcome } from '$lib/api/types';

	const { children } = $props();

	let outcomeData = $state(null as null | AuctionOutcome);
	let streamOk = $state(false);
	const client = new Api(API_URL, fetch);
	onMount(async () => {
		streamOk = true;
		await client.streamOutcomes((data) => (outcomeData = data)).finally(() => (streamOk = false));
	});
</script>

<svelte:head>
	<title>{page.data?.title ?? 'Marketplace API Demonstration'}</title>
</svelte:head>

<div class="mx-auto flex min-h-screen w-4xl max-w-[90vw] flex-col gap-4 pt-8 font-sans">
	<Activity data={outcomeData} ok={streamOk} />
	<h1 class="border-b border-gray-400 py-1 font-bold">
		<a href="/">Flow Trading API Client Demonstration</a>
	</h1>
	<div class="*:page-section contents">
		{@render children()}
	</div>
	<div class="mt-auto border-t border-gray-400 py-1 text-center text-xs">
		Copyright &copy; {new Date().getUTCFullYear()} Forward Market Design LLC
	</div>
</div>
