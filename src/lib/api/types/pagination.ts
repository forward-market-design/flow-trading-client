import {
	array,
	check,
	object,
	optional,
	pipe,
	type GenericSchema,
	type InferOutput
} from 'valibot';

import { DateTime, Uuid } from './base';

// Our API utilizes two different forms of pagination.
// The first, a traditional cursor-based pagination schema, simply uses a UUID
// value to index where to "start from". The second instead specifies a datetime
// range. In either case, the endpoint assumes some sort of sorting and provides
// an updated query that will grab the next page of data, or return an object
// `more === undefined` to indicate that no additional results are availble.
//
// In either case, typically these responses and/or queries are parameterized
// by a data type, which is why these are implemented as functions instead of
// predefined schemas.
//
// We do not leverage any branding here as there is little-to-no validation
// associated to these types, it is just about maintaining the correct shape.

export function CursorQuery<TSchema extends typeof Uuid>(schema: TSchema) {
	return object({
		as_of: optional(DateTime),
		cursor: optional(schema)
	});
}

export type CursorQuery<TSchema extends typeof Uuid> = InferOutput<
	ReturnType<typeof CursorQuery<TSchema>>
>;

export function CursorPagination<TSchema extends typeof Uuid>(schema: TSchema) {
	return object({
		results: array(schema),
		cursor: optional(CursorQuery(schema))
	});
}

export type CursorPagination<TSchema extends typeof Uuid> = InferOutput<
	ReturnType<typeof CursorPagination<TSchema>>
>;

export const DateTimeQuery = pipe(
	object({
		before: optional(DateTime),
		after: optional(DateTime)
	}),
	check(
		({ before, after }) =>
			(before?.valueOf() ?? Number.NEGATIVE_INFINITY) <=
			(after?.valueOf() ?? Number.POSITIVE_INFINITY),
		'`before` must come before `after`'
	)
);

export type DateTimeQuery = InferOutput<typeof DateTimeQuery>;

/**
 * Validate a pagination kind
 */
export function DateTimePagination<TSchema extends GenericSchema>(schema: TSchema) {
	return object({
		results: array(schema),
		more: optional(DateTimeQuery)
	});
}

export type DateTimePagination<TSchema extends GenericSchema> = InferOutput<
	ReturnType<typeof DateTimePagination<TSchema>>
>;
