import { Module, ValidationPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { APP_PIPE } from '@nestjs/core';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService,{
    provide: APP_PIPE,
    useValue: new ValidationPipe({
      whitelist: true,
      always: true,
      forbidNonWhitelisted:true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    })    
  }],
  imports:[DrizzleModule]
})
export class OrdersModule {}
