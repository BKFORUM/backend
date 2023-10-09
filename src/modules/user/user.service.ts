import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isEmpty } from 'lodash';
import { hashPassword } from 'src/common';
import { getOrderBy } from 'src/common/utils/prisma';
import { PrismaService } from 'src/database/services';
import { PaginatedResult, Pagination } from 'src/providers';
import { RoleService } from '../roles';
import { CreateUserDto, GetUsersQueryDto, UpdateUserDto } from './dto';
import { UserResponse } from './interfaces';
import { filterByNotInForum, filterBySearch } from './utils';

@Injectable()
export class UserService {
  constructor(
    private dbContext: PrismaService,
    private roleService: RoleService,
  ) {}

  private readonly logger: Logger = new Logger(UserService.name);

  createUser = async (data: CreateUserDto) => {
    const { fullName, password, username, roles } = data;

    const rolesData = await this.roleService.checkRoles(roles);

    if (!rolesData) {
      throw new BadRequestException('The roles provided are invalid');
    }

    const user = await this.dbContext.user.create({
      data: {
        fullName,
        password,
        username,
        roles: {
          create: rolesData.map((role) => ({
            roleId: role,
          })),
        },
      },
    });

    const getRolesOfUser = await this.dbContext.userToRole.findMany({
      where: {
        userId: user.id,
      },
      select: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      ...user,
      roles: getRolesOfUser,
    };
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
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return user;
  };

  findById = async (id: string) => {
    const user = this.dbContext.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        password: true,
        refreshToken: true,
        fullName: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return user;
  };

  async getAllUsers({
    search,
    forumId,
    order,
    take,
    skip,
  }: GetUsersQueryDto): Promise<PaginatedResult<UserResponse>> {
    if (forumId) {
      const forum = await this.dbContext.forum.findUnique({
        where: { id: forumId },
      });

      if (isEmpty(forum)) {
        throw new NotFoundException('The forum does not exist');
      }
    }

    let orderBy;

    if (order) {
      orderBy = getOrderBy('createdAt', order);
    }

    const [users, total] = await Promise.all([
      this.dbContext.user.findMany({
        where: {
          ...filterBySearch(search),
          ...filterByNotInForum(forumId),
        },
        orderBy,
        skip,
        take,
        select: {
          id: true,
          fullName: true,
          studentId: true,
          username: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.dbContext.user.count({
        where: {
          ...filterBySearch(search),
          ...filterByNotInForum(forumId),
        },
      }),
    ]);

    return Pagination.of({ skip, take }, total, users);
  }

  updateUser = async (id: string, data: UpdateUserDto) => {
    const { roles, fullName, password, refreshToken } = data;

    const rolesData = await this.roleService.checkRoles(roles);

    console.log('role: ', rolesData);

    if (!rolesData) {
      throw new BadRequestException('The roles provided are invalid');
    }

    const updateRoles =
      rolesData.length > 0
        ? {
            deleteMany: {
              roleId: {
                notIn: rolesData,
              },
            },
            createMany: {
              data: rolesData.map((x) => ({ roleId: x })),
              skipDuplicates: true,
            },
          }
        : undefined;

    const user = await this.dbContext.user.update({
      where: {
        id,
      },
      data: {
        fullName,
        password: password ? await hashPassword(password) : undefined,
        refreshToken,
        roles: updateRoles,
      },
    });

    this.logger.log('Updated the user records', { user });
  };
}
