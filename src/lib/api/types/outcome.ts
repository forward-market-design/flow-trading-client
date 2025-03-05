import { number, object, type InferOutput } from 'valibot';
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

export const AuthOutcome = object({
	from: DateTime,
	thru: DateTime,
	price: number(),
	trade: number()
});

export type AuthOutcome = InferOutput<typeof AuthOutcome>;
