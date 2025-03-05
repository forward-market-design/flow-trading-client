import { ProductId } from '$lib/api/types';
import type { ParamMatcher } from '@sveltejs/kit';
import { safeParse } from 'valibot';

export const match = ((param: string): param is ProductId =>
	safeParse(ProductId, param).success) satisfies ParamMatcher;
