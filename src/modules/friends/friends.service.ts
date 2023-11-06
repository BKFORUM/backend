import { BadRequestException, Inject, Injectable } from '@nestjs/common';

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
