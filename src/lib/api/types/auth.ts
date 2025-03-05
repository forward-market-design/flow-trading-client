import {
	brand,
	check,
	finite,
	literal,
	maxValue,
	minValue,
	nullable,
	nullish,
	number,
	object,
	optional,
	pipe,
	record,
	union,
	type InferOutput
} from 'valibot';

import { BidderId, DateTime, ProductId, Uuid } from './base';

const AuthId_ = Symbol('AuthId');
const Portfolio_ = Symbol('Portfolio');
const AuthData_ = Symbol('AuthData');

/**
 * Validate a portfolio id.
 */
export const AuthId = pipe(Uuid, brand(AuthId_));
export type AuthId = InferOutput<typeof AuthId>;

/**
 * Validate a portfolio. Weights should never be 0, but this is not considered an error.
 */
export const Portfolio = pipe(record(ProductId, pipe(number(), finite())), brand(Portfolio_));
export type Portfolio = InferOutput<typeof Portfolio>;

/**
 * When making requests to auth endpoints, the portfolio isn't included in the
 * response unless otherwise requested. "include" returns the portfolio
 * as-defined, while "expand" returns the portfolio in the contemporary product
 * basis.
 */
export const AuthQueryParams = object({
	portfolio: union([literal('exclude'), literal('include'), literal('expand')])
});
export type AuthQueryParams = InferOutput<typeof AuthQueryParams>;

/**
 * Validate auth data.
 */
export const AuthData = pipe(
	object({
		min_rate: nullable(pipe(number(), maxValue(0, 'min rate must be nonpositive'))),
		max_rate: nullable(pipe(number(), minValue(0, 'max rate must be nonnegative'))),
		min_trade: nullish(number()),
		max_trade: nullish(number())
	}),
	check(
		({ min_trade, max_trade }) =>
			(min_trade ?? Number.NEGATIVE_INFINITY) <= (max_trade ?? Number.POSITIVE_INFINITY),
		'trade must be feasible'
	),
	brand(AuthData_)
);
export type AuthData = InferOutput<typeof AuthData>;

/**
 * Validate a complete authorization record.
 */
export const AuthRecord = object({
	bidder_id: BidderId,
	auth_id: AuthId,
	portfolio: optional(Portfolio),
	data: nullable(AuthData),
	version: DateTime,
	trade: optional(number())
});
export type AuthRecord = InferOutput<typeof AuthRecord>;

export const AuthHistoryRecord = object({
	data: nullable(AuthData),
	version: DateTime
});
export type AuthHistoryRecord = InferOutput<typeof AuthHistoryRecord>;
