import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
async function bootstrap() {
  const logger = new Logger('OrdersMS-Main');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    options: {
      transport: Transport.TCP,
      port: Number(process.env.PORT)|| 6000,
    }
  });
  await app.listen();
  logger.log(`Microservice is listening on port ${process.env.PORT}`);
}
bootstrap();
