import { IsNumber, IsPositive, IsString, IsUrl } from 'class-validator';

export class PaidOrderDto {
  @IsString()
  stripePaymentId: string;

  @IsNumber()
  @IsPositive()
  orderId: number;

  @IsString()
  @IsUrl()
  receiptUrl: string;
}
