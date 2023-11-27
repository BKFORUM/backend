import {
  Controller,
  UseGuards,
  Post,
  Body,
  Query,
  Get,
  Delete,
  Param,
  Patch,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guard';
import { CreateEventDto } from './dto/create-event.dto';
import { ReqUser } from '@common/decorator/request-user.decorator';
import { RequestUser, UUIDParam } from '@common/types';
import { EventService } from './event.service';
import { GetEventDto } from './dto/get-events.dto';
import { getSubscribersDto } from './dto/get-subscribers.dto';

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

  @ApiOperation({
    description: 'Update an event by id',
  })
  @Put(':id')
  async updateEvent(
    @Param() { id }: UUIDParam,
    @ReqUser() user: RequestUser,
    @Body() body: CreateEventDto,
  ) {}

  @ApiOperation({
    description: 'Delete an event by id',
  })
  @Delete(':id')
  async deleteEvent(@Param() { id }: UUIDParam, @ReqUser() user: RequestUser) {
    return await this.eventService.deleteEvent(id, user);
  }

  @ApiOperation({
    description: 'Delete an event by id',
  })
  @Patch(':id/cancel')
  async cancelEvent(@Param() { id }: UUIDParam, @ReqUser() user: RequestUser) {
    return await this.eventService.cancelEvent(id, user);
  }

  @ApiOperation({
    description: 'Subscribe an event',
  })
  @Patch(':id/subscribe')
  async subscribeEvent(
    @Param() { id }: UUIDParam,
    @ReqUser() user: RequestUser,
  ) {
    return await this.eventService.subscribeEvent(id, user);
  }

  @ApiOperation({
    description: 'Unsubscribe an event',
  })
  @Patch(':id/unsubscribe')
  async unsubscribeEvent(
    @Param() { id }: UUIDParam,
    @ReqUser() user: RequestUser,
  ) {
    return await this.eventService.unsubscribeEvent(id, user);
  }

  @Get()
  @ApiOperation({
    description: 'Get all events',
  })
  async getEvents(@Query() query: GetEventDto, @ReqUser() user: RequestUser) {
    return this.eventService.getEvents(query, user);
  }

  @ApiOperation({
    description: 'Get subscribers of an event',
  })
  @Get(':id/subscribers')
  async getSubscribers(
    @Query() query: getSubscribersDto,
    @Param() { id }: UUIDParam,
  ) {
    return this.eventService.getSubscribers(id, query);
  }
}
