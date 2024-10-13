
import { IsNumber, IsPositive } from 'class-validator';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus, OrderStatusList } from '../enums/order.enum';

export class PatchOrderDto {
  @IsNumber()
  @IsPositive()
  id: number;
   @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `Possible status values are ${OrderStatusList}`,
  })
  status?: OrderStatus;
}
