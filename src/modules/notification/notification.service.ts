import { Models } from '@common/types';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification } from '@prisma/client';
import { PrismaService } from 'src/database/services';
import { GetNotificationDto } from './dto';
import { NotificationResponse } from './interfaces/notification-response.interface';

@Injectable()
export class NotificationService {
  constructor(
    private dbContext: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async notifyNotification(
    userId: string,
    messageEvent: string,
    data: {
      content: string;
      modelName: Models;
      modelId: string;
      userId: string;
    },
  ): Promise<Notification> {
    const notification = await this.dbContext.notification.create({
      data: {
        content: data.content,
        modelId: data.modelId,
        modelName: String(data.modelName),
        userId: data.userId,
      },
      include: {
        user: true,
      }
    });
    this.eventEmitter.emit(messageEvent, notification, userId);

    return notification;
  }

  async getAllNotifications(
    userId: string,
    dto: GetNotificationDto,
  ): Promise<NotificationResponse> {
    const [notifications, totalRecords] = await Promise.all([this.dbContext.notification.findMany({
      where: { userId },
      include: {
        user: true,
      },
      skip: dto.skip,
      take: dto.take,
    }), this.dbContext.notification.count({ where: { userId } })])

    return {
      data: notifications,
      totalRecords
    }
  }

  async markAsReadNotification(id: string): Promise<void> {
    await this.dbContext.notification.update({
      where: { id },
      data: {
        readAt: new Date(),
      },
    });
  }
}
