import { ReqUser } from '@common/decorator/request-user.decorator';
import { UUIDParam } from '@common/types';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guard';
import { GetNotificationDto } from './dto';
import { NotificationResponse } from './interfaces/notification-response.interface';
import { NotificationService } from './notification.service';

@ApiBearerAuth()
@Controller({
  version: '1',
  path: 'notifications',
})
@ApiTags('Notification')
@UseGuards(AccessTokenGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @ApiProperty({
    description: 'Get all notifications of user',
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllNotifications(
    @ReqUser('id') userId: string,
    @Query() dto: GetNotificationDto,
  ): Promise<NotificationResponse> {
    return this.notificationService.getAllNotifications(userId, dto);
  }

  @ApiProperty({
    description: 'Mark a notification as read',
  })
  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  markAsReadNotification(@Param() { id }: UUIDParam): Promise<void> {
    return this.notificationService.markAsReadNotification(id);
  }
}
