import { Module } from '@nestjs/common';
import { EventGateway } from './gateway';
import { MessageModule } from '@modules/message/message.module';
import { AuthModule } from '@modules/auth';
import { GatewaySessionManager } from './gateway.session';

@Module({
  imports: [MessageModule, AuthModule],
  providers: [EventGateway, GatewaySessionManager],
  exports: [EventGateway],
})
export class GatewayModule {}
