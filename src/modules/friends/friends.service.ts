import { BadRequestException, Injectable } from '@nestjs/common';

import { RequestUser } from '@common/types';
import { selectUser } from '@modules/user/utils';
import { ConversationType, ResourceStatus } from '@prisma/client';
import { PrismaService } from 'src/database/services';

@Injectable()
export class FriendsService {
  constructor(private readonly dbContext: PrismaService) {}
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
    });

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
    await this.dbContext.friendship.findFirstOrThrow({
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
    });

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
        trx.friendship.upsert({
          create: {
            senderId: receiverId,
            receiverId: senderId,
            status,
          },
          update: {
            status,
          },
          where: {
            senderId_receiverId: {
              senderId: receiverId,
              receiverId: senderId,
            },
          },
        }),
        trx.friendship.update({
          where: {
            senderId_receiverId: {
              senderId,
              receiverId,
            },
          },
          data: { status },
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
  }
}
