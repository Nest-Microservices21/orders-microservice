import { NotNull, relations } from 'drizzle-orm';
import { boolean, integer, numeric, pgEnum, pgTable, serial, timestamp ,text, PgBooleanBuilderInitial} from 'drizzle-orm/pg-core';
import { orderItems } from './order-items.schema';
import { orderReceipt } from './order-receipt.schema';

export const paymentEnum = pgEnum('status', ['PENDING', 'DELIVERED', 'CANCELLED', 'PAID']);

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).$type<number>().notNull(),
  totalItems: integer('total_items').notNull(),
  status: paymentEnum('status').default('PENDING').notNull(),
  paid: boolean('paid').notNull().default(false),
  stripeChargeId:text("stripe_charge_id"),
  paidAt: timestamp('paid_at', { withTimezone: true, precision: 3 }),
  createdAt: timestamp('created_at', { withTimezone: true, precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    precision: 3
  }).$onUpdate(() => new Date())
});
export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  receipt: one(orderReceipt)
}));
