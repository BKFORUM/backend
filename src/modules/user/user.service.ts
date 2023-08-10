import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/services';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private dbContext: PrismaService) {}

  createUser = async (data: CreateUserDto) => {
    const user = await this.dbContext.user.create({
      data,
    });
    return user;
  };

  findByUsername = async (username: string) => {
    const user = this.dbContext.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        password: true,
        refreshToken: true,
        fullName: true,
      },
    });
    return user;
  };

  findById = async (id: string) => {
    const user = this.dbContext.user.findUnique({
      where: { id },
    });
    return user;
  };

  updateUser = async (id: string, data: UpdateUserDto) => {
    const user = await this.dbContext.user.update({
      where: {
        id,
      },
      data,
    });
  };
}
