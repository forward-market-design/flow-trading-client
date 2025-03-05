import { CostId } from '$lib/api/types';
import type { ParamMatcher } from '@sveltejs/kit';
import { safeParse } from 'valibot';

export const match = ((param: string): param is CostId =>
	safeParse(CostId, param).success) satisfies ParamMatcher;
