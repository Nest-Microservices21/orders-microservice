import { Module, ValidationPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { APP_PIPE } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import productsConfig, { PRODUCTS_SERVICE } from 'src/config/products.config';

@Module({
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        always: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
  imports: [
    DrizzleModule,
    ClientsModule.registerAsync([
      {
        name: PRODUCTS_SERVICE,
        imports: [ConfigModule.forFeature(productsConfig)],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('product-ms.host'),
            port: configService.get<number>('product-ms.port'),
          },
        }),
      },
    ]),
  ],
})
export class OrdersModule {}
