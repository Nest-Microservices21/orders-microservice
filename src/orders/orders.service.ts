import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { DRIZZLE, DrizzleDB } from 'src/drizzle';
import { RpcNoContentException, RpcNotFoundErrorException } from 'src/common/exceptions/rpc.exception';
import { OrderPaginationDto, PatchOrderDto } from './dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config/nats.config';
import { OrderWithProducts } from './interfaces/order-with-product';
import { OrderStatus } from './enums/order.enum';
import { OrdersRepository } from './repository/orders.repository';
import { calculateTotals } from './utils/order.utils';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    @Inject(NATS_SERVICE) private readonly natsClient: ClientProxy,
    private readonly ordersRepository: OrdersRepository
  ) {}
  async create(createOrderDto: CreateOrderDto): Promise<OrderWithProducts> {
    const ids = [...new Set(createOrderDto.items.map(({ productId }) => productId))];
    const validProducts: { id: number; price: number; name: string }[] = await firstValueFrom(
      this.natsClient.send({ cmd: 'product.validate' }, ids)
    );
    const idValidProducts = validProducts.map((product) => product.id);
    const invalidProducts = ids.filter((id) => !idValidProducts.includes(id));
    if (invalidProducts.length > 0)
      throw new RpcNotFoundErrorException(
        `The following product IDs do not exist ${invalidProducts.join(', ')}`
      );
    const { totalAmount, totalItems, itemsOrder } = calculateTotals(createOrderDto, validProducts);

    const result = await this.db.transaction(async (tx) => {
      const order = await this.ordersRepository.createOrder(totalAmount, totalItems);
      const items = itemsOrder.map((orderItem) => ({
        ...orderItem,
        orderId: order.id
      }));
      await this.ordersRepository.insertOrderItems(items);
      return {
        createdAt: order.createdAt,
        paid: order.paid,
        id: order.id,
        status: order.status as OrderStatus
      };
    });
    return {
      ...result,
      totalAmount,
      totalItems,
      itemsOrder: itemsOrder.map((itemOrder) => ({
        ...itemOrder,
        name: validProducts.find((product) => product.id === itemOrder.productId).name
      }))
    };
  }

  async findAll(paginationDTO: OrderPaginationDto) {
    const { page, limit, status } = paginationDTO;
    const [totalOrders, allOrders] = await Promise.all([
      this.ordersRepository.countOrders(status),
      this.ordersRepository.findOrders({ limit, offset: limit * (page - 1), status })
    ]);

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
    const order = await this.ordersRepository.findOrderById(id);
    if (!order) throw new RpcNotFoundErrorException(`Product with id ${id} not Found`);
    return { data: order };
  }
  async changeOrderStatus(patchOrderDto: PatchOrderDto) {
    const { id: _, ...status } = patchOrderDto;
    if (Object.keys(status).length === 0) throw new RpcNoContentException('');
    const changeStatus = await this.ordersRepository.updateOrderStatus(patchOrderDto.id, status.status);
    return { data: changeStatus };
  }

  async createPaymentSession(order: OrderWithProducts) {
    const paymentSession = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'payments.create_session' },
        {
          orderId: order.id,
          currency: 'usd',
          items: order.itemsOrder.map((itemOrder) => ({
            name: itemOrder.name,
            price: Number(itemOrder.price),
            quantity: itemOrder.quantity
          }))
        }
      )
    );
    return paymentSession;
  }
}
