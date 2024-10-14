import { OrderStatus } from "../enums/order.enum";

export interface CreateOrderDto {
  totalAmount: number;
  totalItems: number;
}

export interface OrderItemDto {
  orderId: number;
  quantity: number;
  productId: number;
  price: string;
}

export interface OrderResult {
  id: number;
  createdAt: Date;
  paid: boolean;
  status: OrderStatus;
}
