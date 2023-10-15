import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { PrismaService } from 'src/database/services';
import { omit } from 'lodash';

@Injectable()
export class TopicService {
  constructor(private readonly dbContext: PrismaService) {}
  create(createTopicDto: CreateTopicDto) {
    return 'This action adds a new topic';
  }

  async getAllTopics() {
    const topics = await this.dbContext.topic.findMany({});
    return topics.map((topic) => omit(topic, 'createdAt', 'updatedAt'));
  }

  findOne(id: number) {
    return `This action returns a #${id} topic`;
  }

  update(id: number, updateTopicDto: UpdateTopicDto) {
    return `This action updates a #${id} topic`;
  }

  remove(id: number) {
    return `This action removes a #${id} topic`;
  }

  async validateTopicIds(topicIds: string[]) {
    const topics = await this.dbContext.user.findMany({
      where: {
        id: {
          in: topicIds,
        },
      },
    });

    if (topics.length !== topicIds.length) {
      throw new NotFoundException(`One or more users not found`);
    }
  }
}
