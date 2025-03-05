import { array, brand, object, pipe, type InferOutput } from 'valibot';
import { AuthRecord } from './auth';
import { DateTime } from './base';
import { CostRecord } from './cost';

const SubmissionRecord_ = Symbol('SubmissionRecord');

export const SubmissionRecord = pipe(
	object({
		auths: array(AuthRecord),
		costs: array(CostRecord),
		as_of: DateTime
	}),
	brand(SubmissionRecord_)
);
export type SubmissionRecord = InferOutput<typeof SubmissionRecord>;
