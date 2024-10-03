import { PickType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsNumber, IsPositive } from 'class-validator';

export class PatchOrderDto extends PickType(CreateOrderDto,["status"]) {
  @IsNumber()
  @IsPositive()
  id: number;
}
