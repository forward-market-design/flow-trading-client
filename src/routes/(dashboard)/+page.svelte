<script lang="ts">
	import { enhance } from '$app/forms';
	import { PaginationAccumulator } from '$lib/api/pagination.svelte';
	import Products from './Products.svelte';
	import Bidders from './Bidders.svelte';
	import { API_URL } from '$lib/api';

	const { data } = $props();

	const openInitialOverflow = data.bidders.length === 0;

	// Because products are paginated, there might be some sort of
	// user-interactive "fetch more products" action, implying a reactive
	// accumulator. However, we also want to reset this accumulator when
	// SvelteKit invalidates the page data. This is not well-discussed in their
	// documentation: mutating $state proxies in a $derived expression leads to
	// errors. Instead, we return a class with $state properties -- this does the
	// trick.
	const productData = $derived(new PaginationAccumulator(data.products, 'push'));
</script>

<details open={openInitialOverflow}>
	<summary><h2 class="inline font-bold">Overview</h2></summary>
	<div class="columns-2 *:indent-4">
		<p>
			This is a demonstration application for <a href="https://forwardmarketdesign.com" class="link"
				>Forward Market Design</a
			>'s Flow Trading API server. This "frontend" remotely connects to a running flow trading
			server and provides basic functionality for a user to interface with their submission and view
			outcomes. The floating panel at the top of the page provides a summary of the connection
			status and recent activity. This same bar also provides a means to schedule and execute
			auctions.
		</p>
		<p>
			This frontend manages a known set of bidders. In the future, this management will grow to
			include the execution of "trade-to-target" strategies on behalf of the bidder. There can be
			multiple frontends managing disparate sets of users, each interacting with the same flow
			trading server.
		</p>
		<p>
			For low-level documentation on auths, costs, and other flow trading primitives, see the <a
				href={new URL('/rapidoc', API_URL).href}>API documentation</a
			>.
		</p>
		{#if data.bidders.length == 0}
			<p>To get started, import a demonstration dataset.</p>
			<form method="POST" action="/admin/import" use:enhance>
				<fieldset class="m-2 border-1 p-2 text-xs">
					<legend>Import Data</legend>
					<button type="submit" name="data" value="simple" class="btn">Simple</button>
				</fieldset>
			</form>
		{/if}
	</div>
</details>

<Bidders bidders={data.bidders} />

<Products data={productData} />
