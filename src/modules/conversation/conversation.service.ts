import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { RequestUser } from '@common/types';
import { PrismaService } from 'src/database/services';
import { Prisma } from '@prisma/client';
import { GetConversationDto } from './dto/get-conversation.dto';
import { searchByMode } from '@common/utils';
import { Pagination } from 'src/providers';
import { GetMessageDto } from './dto/get-message.dto';
import { selectUser } from '@modules/user/utils';
import { GetConversationPayload } from './interface/get-conversation.payload';
import { getAuthorDisplayName, getConversationDisplayName } from './utils/name';
import { CreateMessageDto } from '@modules/message/dto/create-message.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ConversationService {
  constructor(
    private readonly dbContext: PrismaService,
    private readonly event: EventEmitter2,
  ) {}
  create(createConversationDto: CreateConversationDto) {
    return 'This action adds a new conversation';
  }

  async getAllConversations(user: RequestUser, query: GetConversationDto) {
    const { skip, take, search } = query;
    const andWhereConditions: Prisma.Enumerable<Prisma.ConversationWhereInput> =
      [
        {
          users: {
            some: {
              userId: user.id,
            },
          },
        },
      ];

    if (search) {
      andWhereConditions.push({
        displayName: searchByMode(search),
      });
    }

    const [conversations, total] = await Promise.all([
      this.dbContext.conversation.findMany({
        where: {
          AND: andWhereConditions,
        },
        skip,
        take,
        select: {
          avatarUrl: true,
          id: true,
          displayName: true,
          lastMessage: true,
          users: {
            select: {
              userId: true,
              displayName: true,
              user: selectUser,
            },
          },
        },
        orderBy: [
          {
            lastMessage: {
              createdAt: Prisma.SortOrder.desc,
            },
          },
          {
            createdAt: Prisma.SortOrder.desc,
          },
        ],
      }),
      this.dbContext.conversation.count({
        where: {
          AND: andWhereConditions,
        },
      }),
    ]);

    const mappedConversations = conversations.map((c) => ({
      ...c,
      displayName: getConversationDisplayName(c),
    }));

    return Pagination.of({ skip, take }, total, mappedConversations);
  }

  findOne(id: number) {
    return `This action returns a #${id} conversation`;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }

  async createMessage(
    conversationId: string,
    { content, type }: CreateMessageDto,
    user: RequestUser,
  ) {
    const conversation = await this.dbContext.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        users: {
          select: {
            userId: true,
            id: true,
          },
        },
      },
    });

    if (!conversation) throw new BadRequestException('Invalid conversation');

    if (conversation.users.every(({ userId }) => userId !== user.id))
      throw new BadRequestException(
        'You are not a member of this conversation',
      );

    const sender = conversation.users.find(({ userId }) => userId === user.id);

    const message = await this.dbContext.message.create({
      data: {
        conversationId,
        content,
        type,
        userId: sender.id,
      },
    });
    this.event.emit('message.created', message);
    return message;
  }

  async getMemberOfConversations(id: string) {}

  async getAllMessagesOfConversation(
    id: string,
    user: RequestUser,
    query: GetMessageDto,
  ) {
    const conversation = await this.dbContext.conversation.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        users: true,
      },
    });

    if (conversation.users.every(({ userId }) => userId !== user.id)) {
      throw new BadRequestException(
        'You are not permitted to view this conversation',
      );
    }

    const { skip, take, search } = query;

    const andWhereConditions: Prisma.Enumerable<Prisma.MessageWhereInput> = [
      {
        conversationId: id,
      },
    ];

    if (search) {
      andWhereConditions.push({
        content: searchByMode(search),
      });
    }

    const [messages, total] = await Promise.all([
      this.dbContext.message.findMany({
        where: {
          AND: andWhereConditions,
        },
        skip,
        take,
        select: {
          id: true,
          content: true,
          author: {
            select: {
              userId: true,
              displayName: true,
              user: selectUser,
            },
          },
          conversation: {
            select: {
              id: true,
              displayName: true,
              users: {
                select: {
                  userId: true,
                  displayName: true,
                  user: selectUser,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: Prisma.SortOrder.asc,
        },
      }),
      this.dbContext.message.count({
        where: {
          AND: andWhereConditions,
        },
      }),
    ]);

    const mappedMessages = messages.map((m) => ({
      ...m,
      author: {
        ...m.author,
        displayName: getAuthorDisplayName(m.author),
      },
    }));

    return Pagination.of({ skip, take }, total, mappedMessages);
  }
}
