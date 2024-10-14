import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { orders } from './orders.schema';
import { relations } from 'drizzle-orm';

export const orderReceipt = pgTable('order-receipts', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .unique()
    .references(() => orders.id)
    .notNull(),
  receiptUrl: text('receipt_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    precision: 3
  }).$onUpdate(() => new Date())
});

export const orderReceiptRelations = relations(orderReceipt, ({ one }) => ({
  order: one(orders, {
    fields: [orderReceipt.orderId],
    references: [orders.id]
  })
}));
