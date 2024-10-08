import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import natsConfig, { NATS_SERVICE } from 'src/config/nats.config';

const natsClientModule = ClientsModule.registerAsync([
  {
    name: NATS_SERVICE,
    imports: [ConfigModule.forFeature(natsConfig)],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      transport: Transport.NATS,
      options: {
        servers: configService.get<string[]>('nats-config.servers'),
      },
    }),
  },
]);

@Module({
  imports: [natsClientModule],
  exports: [natsClientModule],
})
export class NatsModule {}
