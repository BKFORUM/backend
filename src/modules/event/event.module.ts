import { DatabaseModule } from '@db';
import { NotificationModule } from '@modules/notification';
import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  imports: [DatabaseModule, NotificationModule],
  providers: [EventService],
  controllers: [EventController],
})
export class EventModule {}
