import { OrderStatus } from '../enums/order.enum';
export type ItemOrder = {
  quantity: number;
  productId: number;
  price: string;
  name:string
};
export interface OrderWithProducts {
  totalAmount: number;
  totalItems: number;
  itemsOrder: ItemOrder[];
  createdAt: Date;
  paid: boolean;
  id: number;
  status: OrderStatus;
}
