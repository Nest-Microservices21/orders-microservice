import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE, DrizzleDB, orders, orderItems } from 'src/drizzle';
import { eq, count, ne, and } from 'drizzle-orm';
import { OrderStatus } from '../enums/order.enum';
import { PaidOrderDto } from '../dto';
import { orderReceipt } from 'src/drizzle/schema/order-receipt.schema';
import { CreateOrderDto, OrderItemDto } from '../interfaces/order-repository.types';
@Injectable()
export class OrdersRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async createOrder(tx: DrizzleDB, { totalAmount, totalItems }: CreateOrderDto) {
    const [order] = await tx.insert(orders).values({ totalAmount, totalItems }).returning({
      id: orders.id,
      createdAt: orders.createdAt,
      paid: orders.paid,
      status: orders.status
    });
    return order;
  }

  async insertOrderItems(tx: DrizzleDB, items: OrderItemDto[]) {
    await tx.insert(orderItems).values(items);
  }

  async findOrders(pagination: { limit: number; offset: number; status?: OrderStatus }) {
    return this.db.query.orders.findMany({
      limit: pagination.limit,
      offset: pagination.offset,
      where: pagination.status ? eq(orders.status, pagination.status) : undefined
    });
  }

  async countOrders(status?: OrderStatus) {
    const countTotalOrders = await this.db
      .select({ count: count(orders.id).as('total_orders') })
      .from(orders)
      .where(status ? eq(orders.status, status) : undefined);
    return countTotalOrders[0].count;
  }

  async findOrderById(id: number) {
    return this.db.query.orders.findMany({
      where: eq(orders.id, id),
      with: {
        items: true
      },
      columns: {
        id: true,
        createdAt: true,
        paid: true,
        status: true,
        totalAmount: true
      }
    });
  }

  async updateOrderStatus(id: number, status?: OrderStatus) {
    const updatedOrder = await this.db
      .update(orders)
      // @ts-ignore
      .set({ status })
      .where(and(eq(orders.id, id), ne(orders.status, status)))
      .returning();

    if (updatedOrder.length === 0)
      return {
        status: 'success',
        data: {
          message: 'No update was made because the status is already the same.'
        }
      };
    return updatedOrder;
  }

  async paidOrder(paidOrder: PaidOrderDto) {
    const result = await this.db.transaction(async (tx) => {
      const [{ id: orderId }] = await tx
        .update(orders)
        .set({
          //@ts-ignore
          status: OrderStatus.PAID,
          paid: true,
          stripeChargeId: paidOrder.stripePaymentId,
          paidAt: new Date()
        })
        .where(eq(orders.id, paidOrder.orderId))
        .returning({ id: orders.id });

      await tx.insert(orderReceipt).values({ orderId, receiptUrl: paidOrder.receiptUrl });
    });

    return result;
  }
}
