import { nullable, number, object, record, type InferOutput } from 'valibot';
import { AuthId } from './auth';
import { DateTime } from './base';

export const AuctionOutcome = object({
	from: DateTime,
	thru: DateTime
});

export type AuctionOutcome = InferOutput<typeof AuctionOutcome>;

export const ProductOutcome = object({
	from: DateTime,
	thru: DateTime,
	price: number(),
	trade: number()
});

export type ProductOutcome = InferOutput<typeof ProductOutcome>;

export const SubmissionOutcome = object({
	from: DateTime,
	thru: DateTime,
	auths: record(
		AuthId,
		object({
			price: nullable(number()),
			trade: number()
		})
	)
});

export type SubmissionOutcome = InferOutput<typeof SubmissionOutcome>;

export const AuthOutcome = object({
	from: DateTime,
	thru: DateTime,
	price: nullable(number()),
	trade: number()
});

export type AuthOutcome = InferOutput<typeof AuthOutcome>;
