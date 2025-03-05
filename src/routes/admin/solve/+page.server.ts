import { API_URL, Api } from '$lib/api';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

let timer: ReturnType<typeof setInterval> = null as any;
const timings = {
	s: 1000,
	m: 1000 * 60,
	h: 1000 * 60 * 60
};

export const actions = {
	default: async ({ fetch, locals, request }) => {
		// Deconstruct the POST data
		const data = await request.formData();
		const by = parseInt(data.get('by') as string, 10);
		const unit = data.get('unit') as keyof typeof timings;
		const frequency = parseInt(data.get('freq') as string, 10);

		const client = new Api(API_URL, fetch).asAdmin(locals.token!);

		const batchDuration = `${by}${unit}`;
		async function solve() {
			await client.solveBatches(batchDuration);
		}

		if (!isNaN(by) && unit in timings) {
			try {
				clearInterval(timer);

				if (frequency >= 1) {
					await solve();
				}

				if (frequency >= 2) {
					timer = setInterval(solve, timings[unit] * by);
				}

				return { success: true };
			} catch (e) {
				return fail(500);
			}
		} else {
			return fail(400);
		}
	}
} satisfies Actions;
