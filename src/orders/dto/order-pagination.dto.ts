import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDTO } from 'src/common/dto/pagination.dto';
import { OrderStatus, OrderStatusList } from '../enums/order.enum';

export class OrderPaginationDto extends PaginationDTO {
  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `Possible status values are ${OrderStatusList}`,
  })
  status?: OrderStatus;
}
