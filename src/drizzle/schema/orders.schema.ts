import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  timestamp,
} from 'drizzle-orm/pg-core';
import { orderItems } from './order-items.schema';

export const paymentEnum = pgEnum('status', [
  'PENDING',
  'DELIVERED',
  'CANCELLED',
]);

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 })
    .$type<number>()
    .notNull(),
  totalItems: integer('total_items').notNull(),
  status: paymentEnum('status'),
  paid: boolean('paid').notNull().default(false),
  paidAt: timestamp('paid_at', { withTimezone: true, precision: 3 }),
  createdAt: timestamp('created_at', { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    precision: 3,
  }).$onUpdate(() => new Date()),
});
// export const ordersRelations = relations(orders, ({ many }) => ({
//   items: many(orderItems),
// }));
