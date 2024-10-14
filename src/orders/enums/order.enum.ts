export enum OrderStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  PAID='PAID'

}
export const OrderStatusList: [OrderStatus, OrderStatus, OrderStatus, OrderStatus] = [
  OrderStatus.PENDING,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.PAID
]