import { Controller, UseGuards, Post, Body, Query, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guard';
import { CreateEventDto } from './dto/create-event.dto';
import { ReqUser } from '@common/decorator/request-user.decorator';
import { RequestUser } from '@common/types';
import { EventService } from './event.service';
import { GetEventDto } from './dto/get-events.dto';

@Controller({
  path: 'events',
})
@ApiTags('Event')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class EventController {
  constructor(private readonly eventService: EventService) {}
  @ApiOperation({ description: 'Create an event' })
  @Post()
  async createEvent(
    @Body() body: CreateEventDto,
    @ReqUser() user: RequestUser,
  ) {
    return await this.eventService.createEvent(body, user);
  }
  async updateEvent() {}
  async deleteEvent() {}
  async subscribeEvent() {}
  @Get()
  @ApiOperation({
    description: 'Get all events',
  })
  async getEvents(@Query() query: GetEventDto, @ReqUser() user: RequestUser) {
    return this.eventService.getEvents(query, user);
  }
}
