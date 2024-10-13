import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE, DrizzleDB, orders, orderItems } from 'src/drizzle';
import { eq, count } from 'drizzle-orm';
import { OrderStatus } from '../enums/order.enum';

@Injectable()
export class OrdersRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async createOrder(totalAmount: number, totalItems: number) {
    const [order] = await this.db.insert(orders).values({ totalAmount, totalItems }).returning({
      id: orders.id,
      createdAt: orders.createdAt,
      paid: orders.paid,
      status: orders.status
    });
    return order;
  }

  async insertOrderItems(
    items: {
      orderId: number;
      quantity: number;
      productId: number;
      price: string;
    }[]
  ) {
    await this.db.insert(orderItems).values(items);
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
    return (
      this.db
        .update(orders)
        // @ts-ignore
        .set(status)
        .where(eq(orders.id, id))
        .returning()
    );
  }
}
