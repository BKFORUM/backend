import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { DatabaseModule } from '@db';
import { MessageModule } from '@modules/message/message.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from '@modules/user';

@Module({
  imports: [DatabaseModule, MessageModule, EventEmitterModule, UserModule],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
