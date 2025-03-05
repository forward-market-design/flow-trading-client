import { AuthId } from '$lib/api/types';
import type { ParamMatcher } from '@sveltejs/kit';
import { safeParse } from 'valibot';

export const match = ((param: string): param is AuthId =>
	safeParse(AuthId, param).success) satisfies ParamMatcher;
