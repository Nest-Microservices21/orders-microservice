import { registerAs } from '@nestjs/config';

export const PRODUCTS_SERVICE = 'PRODUCT_SERVICE';

export default registerAs('product-ms', () => ({
  host: process.env.PRODUCT_MICROSERVICE_HOST,
  port: parseInt(process.env.PRODUCT_MICROSERVICE_PORT, 10) || 5432,
}));
