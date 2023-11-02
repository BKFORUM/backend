import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/services';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private dbContext: PrismaService) {}

  async updateComment(id: string, userId: string, dto: UpdateCommentDto) {
    await this.dbContext.comment.update({ where: { id, userId }, data: dto });
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    await this.dbContext.comment.delete({ where: { id, userId } });
  }
}
