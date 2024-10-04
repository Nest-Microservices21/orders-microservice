import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { DrizzleDB } from 'src/drizzle/types/types';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { orders } from 'src/drizzle/schema/orders.schema';
import { asc, count, eq } from 'drizzle-orm';
import { RpcNoContentException, RpcNotFoundErrorException } from 'src/common/exceptions/rpc.exception';
import { OrderPaginationDto } from './dto';
import { PatchOrderDto } from './dto/patch-order.dto';
import { PRODUCTS_SERVICE } from 'src/config/products.config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { orderItems } from 'src/drizzle/schema/order-items.schema';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    @Inject(PRODUCTS_SERVICE) private readonly productsClient: ClientProxy
  ) {}
  async create(createOrderDto: CreateOrderDto) {
    const ids = [...new Set(createOrderDto.items.map(({ productId }) => productId))];
    const validProducts: { id: number; price: number }[] = await firstValueFrom(
      this.productsClient.send({ cmd: 'product.validate' }, ids)
    );
    const idValidProducts = validProducts.map((product) => product.id);
    const invalidProducts = ids.filter((id) => !idValidProducts.includes(id));
    if (invalidProducts.length > 0)
      throw new RpcNotFoundErrorException(
        `The following product IDs do not exist ${invalidProducts.join(', ')}`
      );
    const { totalAmount, totalItems } = createOrderDto.items.reduce(
      (acc, item) => {
        const { quantity, productId } = item;
        const price = validProducts.find((product) => product.id === productId).price;
        return {
          totalAmount: acc.totalAmount + price * quantity,
          totalItems: acc.totalItems + item.quantity
        };
      },
      { totalItems: 0, totalAmount: 0 }
    );
    const itemsOrder = createOrderDto.items.map((orderItem) => ({
      quantity: orderItem.quantity,
      productId: orderItem.productId,
      price: validProducts.find((product) => product.id === orderItem.productId).price.toString()
    }));
    const result = await this.db.transaction(async (_tx) => {
      const [{ id: orderId, createdAt, paid, status }] = await this.db
        .insert(orders)
        .values({ totalAmount, totalItems })
        .returning({ id: orders.id, createdAt: orders.createdAt, paid: orders.paid, status: orders.status });
      const items = itemsOrder.map((orderItem) => ({
        ...orderItem,
        orderId
      }));
      await this.db.insert(orderItems).values(items);
      return { createdAt, paid, status };
    });

    return { ...result, totalAmount, totalItems, itemsOrder };
  }

  async findAll(paginationDTO: OrderPaginationDto) {
    const { page, limit, status } = paginationDTO;
    const countTotalOrders = this.db
      .select({ count: count(orders.id).as('total_orders') })
      .from(orders)
      .where(status ? eq(orders.status, status) : undefined);
    const ordersTotal = this.db.query.orders.findMany({
      limit,
      offset: paginationDTO.limit * (paginationDTO.page - 1),
      where: status ? eq(orders.status, status) : undefined
    });
    const [numTotalOrders, allOrders] = await Promise.all([countTotalOrders, ordersTotal]);
    const totalOrders = numTotalOrders[0].count;
    const totalPages = Math.ceil(totalOrders / limit);

    return {
      data: allOrders,
      meta: {
        totalOrders,
        currentPage: page,
        limit,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
        previousPage: page > 1 ? page - 1 : 1,
        nextPage: page < totalPages ? page + 1 : 1
      }
    };
  }

  async findOne(id: number) {
    const order = await this.db.query.orders.findFirst({
      where: eq(orders.id, id)
    });
    if (!order) throw new RpcNotFoundErrorException(`Product with id ${id} not Found`);
    return { data: order };
  }
  async changeOrderStatus(patchOrderDto: PatchOrderDto) {
    const { id: _, ...status } = patchOrderDto;
    if (Object.keys(status).length === 0) throw new RpcNoContentException('');
    const changeStatus = await this.db
      .update(orders)
      .set(status)
      .where(eq(orders.id, patchOrderDto.id))
      .returning();
    return {
      data: changeStatus
    };
  }
}
