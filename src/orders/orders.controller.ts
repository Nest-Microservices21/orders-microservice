import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { ParseIdPipe } from './pipe/parseId.pipe';
import { OrderPaginationDto, PaidOrderDto, PatchOrderDto, CreateOrderDto } from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'orders.create' })
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    const paymentSession = await this.ordersService.createPaymentSession(order);
    return { paymentSession, order };
  }

  @MessagePattern({ cmd: 'orders.find_all' })
  findAll(@Payload() paginationDTO: OrderPaginationDto) {
    return this.ordersService.findAll(paginationDTO);
  }

  @MessagePattern({ cmd: 'orders.find_one' })
  findOne(@Payload('id', ParseIdPipe) id: number) {
    return this.ordersService.findOne(id);
  }
  @MessagePattern({ cmd: 'orders.change_order_status' })
  changeOrderStatus(@Payload() payload: PatchOrderDto) {
    return this.ordersService.changeOrderStatus(payload);
  }
  @EventPattern('payments.succedded')
  async paidOrder(@Payload() paidOrder: PaidOrderDto) {
    return this.ordersService.paidOrder(paidOrder)
  }
}
