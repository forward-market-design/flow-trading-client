import {
	array,
	brand,
	check,
	nonEmpty,
	nullish,
	object,
	optional,
	pipe,
	string,
	transform,
	type InferOutput
} from 'valibot';
import { DateTime, ProductId } from './base';

// The default implementation assumes time-based products, so we match that
// type structure here. The implementation of flow trading, of course, is
// completely agnostic to what actually makes a product, so consider these
// product definitions as completely arbitrary.

const ProductData_ = Symbol('ProductData');
const ProductQuery_ = Symbol('ProductQuery');

export const ProductData = pipe(
	object({
		kind: pipe(string(), nonEmpty('product kind must be specified')),
		from: DateTime,
		thru: DateTime
	}),
	check(({ from, thru }) => thru >= from),
	brand(ProductData_)
);

export type ProductData = InferOutput<typeof ProductData>;

export const ProductRecord = object({
	id: ProductId,
	...ProductData.entries
});

export type ProductRecord = InferOutput<typeof ProductRecord>;

export const ProductQuery = pipe(
	object({
		kind: nullish(string()),
		before: nullish(DateTime),
		after: nullish(DateTime)
	}),
	check(
		({ before, after }) =>
			(after?.valueOf() ?? Number.POSITIVE_INFINITY) >=
			(before?.valueOf() ?? Number.NEGATIVE_INFINITY)
	),
	transform(({ kind, before, after }) => ({
		kind: kind || null,
		before: before ?? null,
		after: after ?? null
	})),
	brand(ProductQuery_)
);

export type ProductQuery = InferOutput<typeof ProductQuery>;

export const ProductPagination = object({
	results: array(ProductRecord),
	more: optional(ProductQuery)
});

export type ProductPagination = InferOutput<typeof ProductPagination>;
