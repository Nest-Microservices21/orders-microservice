import { PickType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsNumber, IsPositive } from 'class-validator';

export class PatchOrderDto  {
  @IsNumber()
  @IsPositive()
  id: number;
}
