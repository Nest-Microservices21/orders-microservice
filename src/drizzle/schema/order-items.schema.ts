import { integer, numeric, pgTable, serial } from 'drizzle-orm/pg-core';
import { orders } from './orders.schema';
import { relations } from 'drizzle-orm';

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  price: numeric('price').notNull(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
});
export const orderItemRelations = relations(orders, ({ one }) => ({
  order: one(orders),
}));
