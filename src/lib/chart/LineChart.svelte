<script lang="ts" generics="X, Y">
	import type { Snippet } from 'svelte';

	interface Props {
		data: { x: X; y: Y }[];
		x?: [(value: X) => number, (value: number) => X];
		y?: [(value: Y) => number, (value: number) => Y];
		xmin?: X;
		xmax?: X;
		ymin?: Y;
		ymax?: Y;
		xpad?: number;
		ypad?: number;
		xfmt?: Snippet<[X]>;
		yfmt?: Snippet<[Y]>;
		title?: Snippet<[]>;
	}

	function id(x: any) {
		return x;
	}

	let {
		data,
		x = [id, id],
		y = [id, id],
		xpad = 0.1,
		ypad = 0.1,
		xfmt,
		yfmt,
		title,
		...box
	}: Props = $props();

	const points = $derived(data.map((point) => ({ x: x[0](point.x), y: y[0](point.y) })));

	let axes = $derived.by(() => {
		let xmin = Number.POSITIVE_INFINITY;
		let xmax = Number.NEGATIVE_INFINITY;
		let ymin = Number.POSITIVE_INFINITY;
		let ymax = Number.NEGATIVE_INFINITY;

		for (const { x, y } of points) {
			xmin = Math.min(xmin, x);
			xmax = Math.max(xmax, x);
			ymin = Math.min(ymin, y);
			ymax = Math.max(ymax, y);
		}

		const xdelta = ((xmin === xmax ? Math.abs(xmin) : xmax - xmin) * xpad) / 2;
		xmin -= xdelta;
		xmax += xdelta;

		const ydelta = ((ymin === ymax ? Math.abs(ymin) : ymax - ymin) * ypad) / 2;
		ymin -= ydelta;
		ymax += ydelta;

		return {
			xmin: box.xmin === undefined ? xmin : x[0](box.xmin),
			xmax: box.xmax === undefined ? xmax : x[0](box.xmax),
			ymin: box.ymin === undefined ? ymin : y[0](box.ymin),
			ymax: box.ymax === undefined ? ymax : y[0](box.ymax)
		};
	});
</script>

<div
	class="outer"
	style:--x-min={axes.xmin}
	style:--x-max={axes.xmax}
	style:--y-min={axes.ymin}
	style:--y-max={axes.ymax}
>
	{#if xfmt}
		<span class="label xmin">{@render xfmt(x[1](axes.xmin))}</span>
		<span class="label xmax">{@render xfmt(x[1](axes.xmax))}</span>
	{:else}
		<span class="label xmin">{axes.xmin}</span>
		<span class="label xmax">{axes.xmax}</span>
	{/if}
	{#if yfmt}
		<span class="label ymin">{@render yfmt(y[1](axes.ymin))}</span>
		<span class="label ymax">{@render yfmt(y[1](axes.ymax))}</span>
	{:else}
		<span class="label ymin">{axes.ymin}</span>
		<span class="label ymax">{axes.ymax}</span>
	{/if}
	{#if title}
		<div class="title">{@render title()}</div>
	{/if}
	<svg viewBox="0 0 1 1" preserveAspectRatio="none">
		<polyline
			points={points
				.map(
					({ x, y }) =>
						`${(x - axes.xmin) / (axes.xmax - axes.xmin)},${(axes.ymax - y) / (axes.ymax - axes.ymin)}`
				)
				.join(' ')}
		/>
	</svg>
</div>

<style>
	.outer {
		position: relative;
		border: 1px solid currentColor;
		width: 100%;
		height: 100%;
	}

	.title {
		position: absolute;
		top: -0.5em;
		left: 50%;
		translate: -50% -100%;
	}

	.label {
		position: absolute;
		font-size: 0.75em;
	}

	.xmin {
		left: 0;
		bottom: -1em;
		translate: -50% 100%;
	}

	.xmax {
		right: 0;
		bottom: -1em;
		translate: 50% 100%;
	}

	.ymin {
		left: -1em;
		bottom: 0;
		translate: -100% 50%;
	}

	.ymax {
		left: -1em;
		top: 0;
		translate: -100% -50%;
	}

	svg {
		width: 100%;
		height: 100%;
		background: white;
	}

	polyline {
		fill: none;
		vector-effect: non-scaling-stroke;

		stroke: currentColor;
		stroke-width: 2px;
	}
</style>
