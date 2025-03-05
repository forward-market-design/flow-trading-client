import { API_URL, Api } from '$lib/api';
import { ProductData } from '$lib/api/types/product';
import { error, fail, type Actions } from '@sveltejs/kit';
import { parse } from 'valibot';

function nextHour(date: Date, n: number) {
	const newDate = new Date(date);
	newDate.setUTCHours(date.getUTCHours() + n);
	return newDate;
}

function nextDay(date: Date, n: number) {
	const newDate = new Date(date);
	newDate.setUTCDate(date.getUTCDate() + n);
	return newDate;
}

function nextMonth(date: Date, n: number) {
	const newDate = new Date(date);
	newDate.setUTCMonth(date.getUTCMonth() + n);
	return newDate;
}

const units = { h: nextHour, d: nextDay, m: nextMonth };

export const actions = {
	default: async ({ fetch, locals, request }) => {
		// Deconstruct the POST data
		const data = await request.formData();
		const by = parseInt(data.get('by') as string, 10);
		const unit = data.get('unit') as keyof typeof units;
		const from = new Date((data.get('from') as string) + 'Z');
		const thru = new Date((data.get('thru') as string) + 'Z');

		if (!isNaN(by) && unit in units) {
			const products: ProductData[] = [];
			let now = from;
			do {
				let next = units[unit](now, by);
				if (next > thru) {
					break;
				} else {
					products.push(
						parse(ProductData, {
							kind: 'FORWARD',
							from: now,
							thru: next
						})
					);
					now = next;
				}
			} while (true);

			try {
				const client = new Api(API_URL, fetch).asAdmin(locals.token!);
				await client.defineProducts(products);
				return { success: true };
			} catch (e) {
				throw error(500);
			}
		} else {
			throw fail(400);
		}
	}
} satisfies Actions;
