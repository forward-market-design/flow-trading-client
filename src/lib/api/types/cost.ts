import {
	array,
	brand,
	check,
	everyItem,
	finite,
	literal,
	maxValue,
	minLength,
	minValue,
	nullable,
	number,
	object,
	optional,
	pipe,
	record,
	union,
	type InferOutput
} from 'valibot';

import { AuthId } from './auth';
import { BidderId, DateTime, Uuid } from './base';

const CostId_ = Symbol('CostId');
const Group_ = Symbol('Group');
const Constant_ = Symbol('Constant');
const Curve_ = Symbol('Curve');

/**
 * Validate a group id.
 */
export const CostId = pipe(Uuid, brand(CostId_));
export type CostId = InferOutput<typeof CostId>;

/**
 * Validate a group. Weights should never be 0, but this is not considered an error.
 *
 */
export const Group = pipe(record(AuthId, pipe(number(), finite())), brand(Group_));
export type Group = InferOutput<typeof Group>;

/**
 * When making requests to cost endpoints, the group may or may not be desired.
 */
export const CostQueryParams = object({
	group: union([literal('exclude'), literal('include')])
});
export type CostQueryParams = InferOutput<typeof CostQueryParams>;

/**
 * Validate a constant demand curve.
 */
export const Constant = pipe(
	object({
		min_rate: nullable(pipe(number(), maxValue(0.0, 'min_rate must be nonpositive'))),
		max_rate: nullable(pipe(number(), minValue(0.0, 'max_rate must be nonnegative'))),
		price: pipe(number(), finite())
	}),
	brand(Constant_)
);
export type Constant = InferOutput<typeof Constant>;

/**
 * Validate a curve.
 */
export const Curve = pipe(
	array(object({ rate: pipe(number(), finite()), price: pipe(number(), finite()) })),
	minLength(1),
	check(
		(pts) => pts.at(0)!.rate <= 0 && pts.at(-1)!.rate >= 0,
		'curve must contain rate=0 in its domain'
	),
	everyItem(
		(_, idx, arr) => idx === 0 || arr[idx].rate >= arr[idx - 1].rate,
		'curve rates must be weakly monotone increasing'
	),
	everyItem(
		(_, idx, arr) => idx === 0 || arr[idx].price <= arr[idx - 1].price,
		'curve prices must be weakly monotone decreasing'
	),
	brand(Curve_)
);
export type Curve = InferOutput<typeof Curve>;

/**
 * Validate a cost (which is either a curve or constant).
 */
export const CostData = union([Constant, Curve]);
export type CostData = InferOutput<typeof CostData>;

/**
 * Validate a complete bid record.
 */
export const CostRecord = object({
	bidder_id: BidderId,
	cost_id: CostId,
	group: optional(Group),
	data: nullable(CostData),
	version: DateTime
});
export type CostRecord = InferOutput<typeof CostRecord>;

export const CostHistoryRecord = object({
	data: nullable(CostData),
	version: DateTime
});
export type CostHistoryRecord = InferOutput<typeof CostHistoryRecord>;
