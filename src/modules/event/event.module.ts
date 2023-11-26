import { DatabaseModule } from '@db';
import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';

@Module({
  imports: [DatabaseModule],
  providers: [EventService],
  controllers: [EventController],
})
export class EventModule {}
