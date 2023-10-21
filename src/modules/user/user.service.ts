import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { isNotEmpty } from 'class-validator';
import { isEmpty } from 'lodash';
import { RequestUser, hashPassword } from 'src/common';
import { getOrderBy } from 'src/common/utils/prisma';
import { PrismaService } from 'src/database/services';
import { PaginatedResult, Pagination } from 'src/providers';
import { RoleService } from '../roles';
import { CreateUserDto, GetUsersQueryDto, UpdateUserDto } from './dto';
import { UserResponse } from './interfaces';
import { filterByInOrNotInForum, filterBySearch } from './utils';

@Injectable()
export class UserService {
  constructor(
    private dbContext: PrismaService,
    private roleService: RoleService,
  ) {}

  private readonly logger: Logger = new Logger(UserService.name);

  createUser = async (data: CreateUserDto) => {
    const { fullName, password, email, roles, dateOfBirth, gender, facultyId } =
      data;

    const rolesData = await this.roleService.checkRoles(roles);

    if (!rolesData) {
      throw new BadRequestException('The roles provided are invalid');
    }

    const existedUsername = await this.findByUsername(email);

    if (isNotEmpty(existedUsername)) {
      throw new BadRequestException('The username has already been used');
    }

    const user = await this.dbContext.user.create({
      data: {
        fullName,
        password,
        email,
        dateOfBirth: new Date(dateOfBirth).toISOString(),
        gender,
        facultyId,
        roles: {
          create: rolesData.map((role) => ({
            roleId: role.id,
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
            email: username,
          },
        ],
      },
      select: {
        id: true,
        email: true,
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
    const user = this.dbContext.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        email: true,
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
    type,
    isInForum,
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
      orderBy = getOrderBy<User>({ defaultValue: 'createdAt', order });
    }

    const [users, total] = await Promise.all([
      this.dbContext.user.findMany({
        where: {
          type,
          ...filterBySearch(search),
          ...filterByInOrNotInForum(forumId, isInForum),
        },
        orderBy,
        skip,
        take,
        select: {
          id: true,
          fullName: true,
          dateOfBirth: true,
          email: true,
          address: true,
          phoneNumber: true,
          gender: true,
          type: true,
          facultyId: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.dbContext.user.count({
        where: {
          type,
          ...filterBySearch(search),
          ...filterByInOrNotInForum(forumId, isInForum),
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

    const existedUser = await this.dbContext.user.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (isEmpty(existedUser.id)) {
      throw new BadRequestException('The user does not exist');
    }

    const updateRoles =
      rolesData.length > 0
        ? {
            deleteMany: {
              roleId: {
                notIn: rolesData.map(({ id }) => id),
              },
            },
            createMany: {
              data: rolesData.map((x) => ({ roleId: x.id })),
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

  async validateUserIds(userIds: string[]) {
    const users = await this.dbContext.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    if (users.length !== userIds.length) {
      throw new NotFoundException(`One or more users not found`);
    }
  }

  async getProfile({ id }: RequestUser) {
    const currentUser = await this.dbContext.user.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        id: true,
        fullName: true,
        dateOfBirth: true,
        email: true,
        address: true,
        phoneNumber: true,
        gender: true,
        type: true,
        faculty: {
          select: {
            id: true,
            name: true,
          },
        },
        forums: {
          select: {
            id: true,
            type: true,
            name: true,
          },
        },
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      ...currentUser,
      roles: currentUser.roles.map((role) => {
        return role.role;
      }),
    };
  }
}
