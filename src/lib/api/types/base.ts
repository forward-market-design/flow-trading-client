/**
 * A module for the types used by the API
 * @module
 */

import {
	brand,
	date,
	isoTimestamp,
	pipe,
	string,
	transform,
	union,
	uuid,
	type InferOutput
} from 'valibot';

/*
We provide below a set of schema validators for any and every type the API
expects or sends, using the `valibot` library.

Note that in some circumstances, we do (or do not) check for `finite()` after a
`number()`. When the API allows for infinite values, it expects the serialized
JSON to contain a `null` value. Fortunately, the following is mandated by the
ES specification:
  > JSON.stringify(Number.POSITIVE_INFINITY) === "null"
Thus, anywhere we do not check for `finite()`, implicitly signaling that
infinite values are okay, the JSON serialization process will do the right thing!

Similarly, we terminate our `DateTime` with a transformation to
`new Date()`. When we are actually sending datetime values to the API, e.g. as
part of a query operation, we can rely on the Date object being transformed to
the ISO string as part of the JSON serialization.

Note that we make extensive use of branding for many of the types. This ensures
that a type cannot be constructed without the requisite validation.
*/

// A simple UUID schema for reuse.
export const Uuid = pipe(string(), uuid('unable to parse uuid'));
export type Uuid = InferOutput<typeof Uuid>;

// A simple datetime schema.
export const DateTime = union([
	pipe(
		string(),
		isoTimestamp('unable to parse datetime'),
		transform((dt) => new Date(dt))
	),
	date()
]);
export type DateTime = InferOutput<typeof DateTime>;

const BidderId_ = Symbol('BidderId');
/**
 * Validate an account id.
 */
export const BidderId = pipe(Uuid, brand(BidderId_));
export type BidderId = InferOutput<typeof BidderId>;

const ProductId_ = Symbol('ProductId');
/**
 * Validate a product id.
 */
export const ProductId = pipe(Uuid, brand(ProductId_));
export type ProductId = InferOutput<typeof ProductId>;
