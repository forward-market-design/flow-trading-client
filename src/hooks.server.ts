import { BidderId } from '$lib/api/types';
import { token } from '$lib/server/api';
import type { Handle } from '@sveltejs/kit';
import { parse } from 'valibot';

export const handle: Handle = async ({ event, resolve }) => {
	// NOTE: a real application would extract the token from a cookie, but since
	// this is a demonstration we automatically create the token for any and
	// every user. Obviously this is a major security issue for a real app.
	if (event.url.pathname.startsWith('/admin/')) {
		event.locals.token = await token(parse(BidderId, '00000000-0000-0000-0000-000000000000'), true);
	} else if (event.params.bidder_id) {
		event.locals.token = await token(parse(BidderId, event.params.bidder_id), false);
	}

	return await resolve(event);
};
