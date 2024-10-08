import { Controller} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ParseIdPipe } from './pipe/parseId.pipe';
import { OrderPaginationDto } from './dto';
import { PatchOrderDto } from './dto/patch-order.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern({ cmd: 'orders.create' })
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern({ cmd: 'orders.find_all' })
  findAll(@Payload() paginationDTO:OrderPaginationDto) {
    return this.ordersService.findAll(paginationDTO);
  }

  @MessagePattern({ cmd: 'orders.find_one' })
  findOne(@Payload('id',ParseIdPipe) id: number) {
    return this.ordersService.findOne(id);
  }
  @MessagePattern({ cmd: 'orders.change_order_status' })
  changeOrderStatus(@Payload() payload:PatchOrderDto) {
    return this.ordersService.changeOrderStatus(payload)
  }
}
