import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { DrizzleDB } from 'src/drizzle/types/types';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import { orders } from 'src/drizzle/schema/orders.schema';
import { count, eq } from 'drizzle-orm';
import {
  RpcNoContentException,
  RpcNotFoundErrorException,
} from 'src/common/exceptions/rpc.exception';
import { OrderPaginationDto } from './dto';
import { PatchOrderDto } from './dto/patch-order.dto';

@Injectable()
export class OrdersService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}
  async create(createOrderDto: CreateOrderDto) {
    return await this.db.insert(orders).values(createOrderDto).returning();
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
      where: status ? eq(orders.status, status) : undefined,
    });
    const [numTotalOrders, allOrders] = await Promise.all([
      countTotalOrders,
      ordersTotal,
    ]);
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
        nextPage: page < totalPages ? page + 1 : 1,
      },
    };
  }

  async findOne(id: number) {
    const order = await this.db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
    if (!order)
      throw new RpcNotFoundErrorException(`Product with id ${id} not Found`);
    return { data: order };
  }
  async changeOrderStatus(patchOrderDto: PatchOrderDto) {
    const { id: _, ...status } = patchOrderDto;
    if (Object.keys(status).length === 0) throw new RpcNoContentException('');

    const changeStatus =await  this.db
      .update(orders)
      // @ts-expect-error : error
      .set(status)
      .where(eq(orders.id, patchOrderDto.id))
      .returning();
    return {
      data:changeStatus,
    };
  }
}
