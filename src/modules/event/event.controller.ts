import { ReqUser } from '@common/decorator/request-user.decorator';
import { RequestUser, UUIDParam } from '@common/types';
import {
  CreateCommentDto,
  GetCommentDto,
  UpdateCommentDto,
} from '@modules/comments/dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guard';
import { CreateEventDto } from './dto/create-event.dto';
import { GetEventDto } from './dto/get-events.dto';
import { getSubscribersDto } from './dto/get-subscribers.dto';
import { UpdateEventParam } from './dto/update-event.dto';
import { EventService } from './event.service';
import { UpdateEventDto } from './dto/update-event.dto';

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
    @Body() body: UpdateEventDto,
  ) {
    return this.eventService.updateEvent(id, user, body);
  }

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

  @ApiProperty({
    description: 'Create a comment in a event',
  })
  @Post(':id/event-comments')
  @HttpCode(HttpStatus.CREATED)
  createComment(
    @Param() { id }: UUIDParam,
    @Body() dto: CreateCommentDto,
    @ReqUser() user: RequestUser,
  ) {
    return this.eventService.createEventComment(id, user, dto);
  }

  @ApiProperty({
    description: 'Get comments in a event',
  })
  @Get(':id/event-comments')
  @HttpCode(HttpStatus.OK)
  getComments(@Param() { id }: UUIDParam, @Query() dto: GetCommentDto) {
    return this.eventService.getEventComments(id, dto);
  }

  @ApiOperation({
    description: 'Update a event comment',
  })
  @Put(':id/event-comments/:eventCommentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateComment(
    @Param() { id, eventCommentId }: UpdateEventParam,
    @ReqUser('id') userId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.eventService.updateEventComment(
      id,
      userId,
      eventCommentId,
      dto,
    );
  }

  @ApiOperation({
    description: 'Delete a event comment',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id/event-comments/:eventCommentId')
  deleteForum(
    @Param() { id, eventCommentId }: UpdateEventParam,
    @ReqUser('id') userId: string,
  ) {
    return this.eventService.deleteEventComment(id, userId, eventCommentId);
  }
}
