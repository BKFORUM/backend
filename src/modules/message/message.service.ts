import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/database/services';
import { selectUser } from '@modules/user/utils';
import { WsException } from '@nestjs/websockets';
import { RequestUser } from '@common/types';

@Injectable()
export class MessageService {
  constructor(private readonly dbContext: PrismaService) {}
  async create(createMessageDto: CreateMessageDto, reqUser: string) {
    const { conversationId } = createMessageDto;
    const conversation = await this.dbContext.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        users: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!conversation) throw new BadRequestException('Invalid conversation');

    if (conversation.users.every(({ userId }) => userId !== reqUser))
      throw new WsException('You are not a member of this conversation');

    const message = await this.dbContext.message.create({
      data: {
        ...createMessageDto,
        userId: reqUser,
      },
    });

    return message;
  }

  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  async delete(user: RequestUser, messageId: string) {
    const message = await this.dbContext.message.findUnique({
      where: {
        id: messageId,
      },
      select: {
        userId: true,
        conversationId: true,
      },
    });

    if (!message || message.userId !== user.id) {
      throw new BadRequestException('You cannot delete this message');
    }

    await this.dbContext.message.delete({
      where: {
        id: messageId,
      },
    });

    return message;
  }
}
