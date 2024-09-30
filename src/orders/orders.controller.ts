import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'orders.create' })
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern({ cmd: 'orders.find_all' })
  findAll() {
    return this.ordersService.findAll();
  }

  @MessagePattern({ cmd: 'orders.find_one' })
  findOne(@Payload() id: number) {
    return this.ordersService.findOne(id);
  }
  @MessagePattern({ cmd: 'orders.change_order_status' })
  changeOrderStatus(@Payload() payload: { orderId: number; newStatus: string }) {
    const { orderId, newStatus } = payload;
    return this.ordersService.changeOrderStatus()
  }
}
