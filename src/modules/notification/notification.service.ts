import { Models, UserResponse } from '@common/types';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
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
    sender: UserResponse,
    receiverId: string,
    messageEvent: string,
    data: {
      content: string;
      modelName: Models;
      modelId: string;
      receiverId: string;
    },
  ) {
    const notification = await this.dbContext.notification.create({
      data: {
        content: data.content,
        modelId: data.modelId,
        modelName: String(data.modelName),
        userId: data.receiverId,
        senderId: sender.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            fullName: true,
            email: true,
            dateOfBirth: true,
            gender: true,
            phoneNumber: true,
            address: true,
            avatarUrl: true,
            type: true,
            facultyId: true,
          },
        },
      },
    });
    this.eventEmitter.emit(messageEvent, notification, receiverId);

    return notification;
  }

  async getAllNotifications(
    userId: string,
    dto: GetNotificationDto,
  ): Promise<NotificationResponse> {
    const [notifications, totalRecords, totalUnreadNotifications] = await Promise.all([
      this.dbContext.notification.findMany({
        include: {
          sender: true,
        },
        where: { userId },
        skip: dto.skip,
        take: dto.take,
        orderBy: {
          createdAt: Prisma.SortOrder.desc,
        }
      }),
      this.dbContext.notification.count({ where: { userId } }),
      this.dbContext.notification.count({ where: { userId, readAt: null } }),
    ]);

    return {
      data: notifications,
      totalRecords,
      totalUnreadNotifications,
    };
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
