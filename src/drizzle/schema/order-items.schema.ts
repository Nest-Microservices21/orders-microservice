import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
} from 'drizzle-orm/pg-core';
import { orders } from './orders.schema';

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  price: numeric('price').notNull(),
  orderId: integer('order_id').references(() => orders.id)
});
// export const relatin