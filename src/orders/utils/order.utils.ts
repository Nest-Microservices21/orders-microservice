import { CreateOrderDto } from '../dto';

export const calculateTotals = (
  createOrderDto: CreateOrderDto,
  validProducts: { id: number; price: number }[]
) => {
  const { totalAmount, totalItems } = createOrderDto.items.reduce(
    (acc, item) => {
      const price = validProducts.find((product) => product.id === item.productId)?.price || 0;
      return {
        totalAmount: acc.totalAmount + price * item.quantity,
        totalItems: acc.totalItems + item.quantity
      };
    },
    { totalItems: 0, totalAmount: 0 }
  );

  const itemsOrder = createOrderDto.items.map((item) => ({
    quantity: item.quantity,
    productId: item.productId,
    price: validProducts.find((product) => product.id === item.productId)?.price.toString() || '0'
  }));

  return { totalAmount, totalItems, itemsOrder };
};
