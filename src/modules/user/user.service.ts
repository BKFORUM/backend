import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/services';
import { CreateUserDto, GetUsersQueryDto, UpdateUserDto } from './dto';
import { Pagination } from 'src/providers';
import { uniq } from 'lodash';
import { hashPassword } from 'src/common';
import { RoleService } from '../roles';

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
        password: await hashPassword(password),
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
