<script lang="ts">
	import AlertCheck from '$lib/icons/AlertCheck.svelte';
	import AlertExclamation from '$lib/icons/AlertExclamation.svelte';
	import AlertInfo from '$lib/icons/AlertInfo.svelte';
	import Help from '$lib/icons/Help.svelte';
	import type { Component, Snippet } from 'svelte';

	const classes = {
		primary: 'alert-primary',
		success: 'alert-success',
		danger: 'alert-danger',
		warning: 'alert-warning',
		info: 'alert-info',
		secondary: 'alert-secondary'
	};

	const icons = {
		primary: AlertInfo,
		success: AlertCheck,
		danger: AlertExclamation,
		warning: AlertExclamation,
		info: AlertInfo,
		secondary: AlertInfo
	} satisfies Record<keyof typeof classes, Component>;

	interface Props {
		icon?: boolean;
		type: keyof typeof classes;
		children: Snippet<[]>;
	}

	const { icon = false, type, children }: Props = $props();

	const AlertComponent = $derived(icons[type]);
</script>

<div class={classes[type]}>
	{#if icon}<AlertComponent />{/if}
	{@render children()}
</div>
