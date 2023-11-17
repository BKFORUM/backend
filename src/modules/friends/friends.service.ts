import { BadRequestException, Injectable } from '@nestjs/common';

import { RequestUser } from '@common/types';
import { NotificationService } from '@modules/notification';
import { selectUser } from '@modules/user/utils';
import { ConversationType, ResourceStatus } from '@prisma/client';
import { PrismaService } from 'src/database/services';
import { MessageEvent } from 'src/gateway/enum';

@Injectable()
export class FriendsService {
  constructor(
    private readonly dbContext: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}
  async sendFriendRequests({ id: senderId }: RequestUser, receiverId: string) {
    const existedFriendship = await this.dbContext.friendship.findFirst({
      where: {
        OR: [
          {
            senderId: senderId,
            receiverId: receiverId,
          },
          {
            senderId: receiverId,
            receiverId: senderId,
          },
        ],
      },
    });

    if (existedFriendship) {
      throw new BadRequestException('The request is already made');
    }

    const request = await this.dbContext.friendship.create({
      data: {
        senderId,
        receiverId,
        status: ResourceStatus.PENDING,
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
        receiver: {
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

    await this.notificationService.notifyNotification(
      request.sender,
      request.receiverId,
      MessageEvent.REQUEST_FRIEND_CREATED,
      {
        content: `đã gửi lời mời kết bạn cho bạn`,
        modelId: 'cb5c4e15-c785-4b32-874d-fac3766adb5b',
        modelName: 'friendship',
        receiverId: request.receiverId,
      },
    );

    return request;
  }

  async getAllFriendsRequest(user: RequestUser) {
    const requests = await this.dbContext.friendship.findMany({
      where: {
        receiverId: user.id,
        status: ResourceStatus.PENDING,
      },
      select: {
        id: true,
        sender: selectUser,
      },
    });

    return requests;
  }

  async patchFriendsRequest(
    senderId: string,
    { id: receiverId }: RequestUser,
    status: ResourceStatus,
  ) {
    const friendship = await this.dbContext.friendship.findFirstOrThrow({
      where: {
        OR: [
          {
            senderId,
            receiverId,
          },
          {
            senderId: receiverId,
            receiverId: senderId,
          },
        ],
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
        receiver: {
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
          }
        }
      },
    });

    if (status === ResourceStatus.DELETED) {
      await this.dbContext.friendship.delete({
        where: {
          id: friendship.id,
        },
      });
      return;
    }

    const hasConversation = await this.dbContext.conversation.findFirst({
      where: {
        type: ConversationType.CHAT,
        users: {
          every: {
            OR: [{ userId: senderId }, { userId: receiverId }],
          },
        },
      },
    });

    const canCreateConversation =
      !hasConversation && status === ResourceStatus.ACTIVE;

    await this.dbContext.$transaction(async (trx) => {
      await Promise.all([
        trx.friendship.update({
          where: {
            id: friendship.id,
          },
          data: {
            status,
          },
        }),
        canCreateConversation
          ? trx.conversation.create({
              data: {
                type: ConversationType.CHAT,
                users: {
                  create: [
                    {
                      userId: receiverId,
                    },
                    {
                      userId: senderId,
                    },
                  ],
                },
              },
            })
          : undefined,
      ]);
    });

    await this.notificationService.notifyNotification(friendship.receiver, senderId, MessageEvent.REQUEST_FRIEND_APPROVED, {
      content: `đã chấp nhận lời mời kết bạn của bạn`,
      modelId: 'a9b2e49d-afcb-4e2a-9ef4-8281172a4502',
      modelName: 'friendship',
      receiverId: senderId
    });
  }

  async getFriendList(user: RequestUser) {
    const friendList = await this.dbContext.friendship.findMany({
      where: {
        OR: [
          {
            receiverId: user.id,
            status: ResourceStatus.ACTIVE,
          },
          {
            senderId: user.id,
            status: ResourceStatus.ACTIVE,
          },
        ],
      },
      select: {
        senderId: true,
        receiverId: true,
        sender: selectUser,
        receiver: selectUser,
      },
    });

    const friends = friendList.map(({ senderId, sender, receiver }) => {
      const friend = user.id === senderId ? receiver : sender;
      return friend;
    });

    return friends;
  }
}
