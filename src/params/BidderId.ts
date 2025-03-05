import { BidderId } from '$lib/api/types';
import type { ParamMatcher } from '@sveltejs/kit';
import { safeParse } from 'valibot';

export const match = ((param: string): param is BidderId =>
	safeParse(BidderId, param).success) satisfies ParamMatcher;
