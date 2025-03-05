import type { BidderId } from '$lib/api/types';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const bidder = sqliteTable('bidder', {
	id: text('id').primaryKey().$type<BidderId>(),
	name: text('name').notNull()
});
