import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/services';
import { CreateUserDto, GetUsersQueryDto, UpdateUserDto } from './dto';
import { Pagination } from 'src/providers';

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
    const user = this.dbContext.user.findFirst({
      where: {
        OR: [
          {
            username: username,
          },
          {
            studentId: username,
          },
        ],
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

  getAllUsers = async ({ search, skip, take }: GetUsersQueryDto) => {
    const [total, users] = await Promise.all([
      this.dbContext.user.count({}),
      this.dbContext.user.findMany({
        skip,
        take,
      }),
    ]);

    return Pagination.of({ take, skip }, total, users);
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
