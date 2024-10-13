export interface PaidOrder {
  stripePaymentId: string;
  orderId: string;
  receiptUrl: string;
}
