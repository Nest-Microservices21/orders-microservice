import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { OrderStatus } from '../enums/order.enum';
export class CreateOrderDto {
  @IsNumber()
  @IsPositive()
  totalAmount: number;
  
  
  @IsNumber()
  @IsPositive()
  totalItems: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsBoolean()
  @IsOptional()
  paid: boolean = false;
}
