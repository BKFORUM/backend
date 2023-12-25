import { FacultyService } from '@modules/faculty';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  Friendship,
  Gender,
  ResourceStatus,
  User,
  UserType,
} from '@prisma/client';
import { isNotEmpty, validate } from 'class-validator';
import { concat, isEmpty, omit } from 'lodash';
import * as moment from 'moment';
import {
  RequestUser,
  compareHash,
  getDay,
  getStudentAvatarUrl,
  hashPassword,
  readXlsxFile,
} from 'src/common';
import { getOrderBy } from 'src/common/utils/prisma';
import { PrismaService } from 'src/database/services';
import { PaginatedResult, Pagination } from 'src/providers';
import { RoleService } from '../roles';
import { CreateUserDto, GetUsersQueryDto, UpdateUserDto } from './dto';
import { ImportUserDto } from './dto/import-user.dto';
import { UserResponse } from './interfaces';
import { filterByInOrNotInForum, filterBySearch, selectUser } from './utils';

@Injectable()
export class UserService {
  constructor(
    private dbContext: PrismaService,
    private roleService: RoleService,
    private facultyService: FacultyService,
  ) {}

  private readonly logger: Logger = new Logger(UserService.name);

  async generatePassword(dateOfBirth: Date) {
    const password = getDay(dateOfBirth).split('-').join('');
    return await hashPassword(password);
  }

  validateDob(dob: Date) {
    const age = new Date().getFullYear() - new Date(dob).getFullYear() + 1;
    return age >= 18;
  }

  createUser = async (data: CreateUserDto) => {
    const {
      fullName,
      password,
      email,
      roles,
      dateOfBirth,
      gender,
      facultyId,
      type,
      address,
      phoneNumber,
    } = data;

    selectUser;

    const rolesData = await this.roleService.checkRoles(roles);

    if (!rolesData) {
      throw new BadRequestException('The roles provided are invalid');
    }

    const validateDob = this.validateDob(dateOfBirth);
    if (!validateDob) {
      throw new BadRequestException('User must be more than 18 years old');
    }

    const rolesToAdd =
      rolesData.length > 0
        ? rolesData
        : await this.roleService.getDefaultRole();

    const avatarUrl =
      type === UserType.STUDENT ? getStudentAvatarUrl(email) : null;
    const existedUsername = await this.findByUsername(email);

    const hashPassword = password
      ? password
      : await this.generatePassword(dateOfBirth);

    if (isNotEmpty(existedUsername)) {
      throw new BadRequestException('The username has already been used');
    }

    const user = await this.dbContext.user.create({
      data: {
        fullName,
        email,
        password: hashPassword,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        facultyId,
        type,
        avatarUrl,
        phoneNumber,
        address,
        roles: {
          create: rolesToAdd.map((role) => ({
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
    const user = this.dbContext.user.findUnique({
      where: {
        email: username,
      },

      select: {
        id: true,
        email: true,
        password: true,
        refreshToken: true,
        fullName: true,
        avatarUrl: true,
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

  getCredentials = async (id: string) => {
    const user = this.dbContext.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
        refreshToken: true,
        fullName: true,
        avatarUrl: true,
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

  findById = async (id: string, yourId?: string) => {
    const user = await this.dbContext.user.findUniqueOrThrow({
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
        sentRequests: true,
        receivedRequests: true,
        forums: {
          select: {
            id: true,
            type: true,
            avatarUrl: true,
            modId: true,
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
    let friendStatus = undefined;
    if (yourId) {
      const requests = concat(user.sentRequests, user.receivedRequests);

      const yourRequest = requests.find(
        ({ senderId, receiverId }) =>
          yourId === senderId || yourId === receiverId,
      );
      friendStatus = this.getRequestStatus(yourRequest, yourId);
    }

    return {
      ...user,
      roles: user.roles.map((role) => {
        return role.role;
      }),
      friendStatus,
    };
  };

  async getAllUsers(
    { search, forumId, type, isInForum, order, take, skip }: GetUsersQueryDto,
    reqUser: RequestUser,
  ): Promise<PaginatedResult<UserResponse>> {
    if (forumId) {
      const forum = await this.dbContext.forum.findUnique({
        where: { id: forumId },
      });

      if (isEmpty(forum)) {
        throw new NotFoundException('The forum does not exist');
      }
    }

    let orderBy = getOrderBy<User>({ defaultValue: 'updatedAt', order });

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
          sentRequests: true,
          receivedRequests: true,
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

    const mappedUsers = users.map((user) => {
      const requests = concat(user.sentRequests, user.receivedRequests);
      const yourRequest = requests.find(
        ({ senderId, receiverId }) =>
          reqUser.id === senderId || reqUser.id === receiverId,
      );
      const friendStatus = this.getRequestStatus(yourRequest, reqUser.id);

      return {
        ...omit(user, 'sentRequests', 'receivedRequests'),
        friendStatus,
      };
    });

    return Pagination.of({ skip, take }, total, mappedUsers);
  }

  private getRequestStatus(request: Friendship, userId: string) {
    if (!request) return 'NOT FRIEND';
    switch (request.status) {
      case ResourceStatus.PENDING:
        const pendingStatus =
          userId === request.receiverId ? 'PENDING_RECEIVED' : 'PENDING_SENT';
        return pendingStatus;
      default:
        return request.status;
    }
  }

  updateUser = async (id: string, data: UpdateUserDto) => {
    const {
      roles,
      fullName,
      password,
      refreshToken,
      address,
      dateOfBirth,
      gender,
      phoneNumber,
      facultyId,
      avatarUrl,
    } = data;

    const rolesData = await this.roleService.checkRoles(roles);

    if (!rolesData) {
      throw new BadRequestException('The roles provided are invalid');
    }

    const existedUser = await this.dbContext.user.findUnique({
      where: { id },
      select: {
        id: true,
        password: true,
      },
    });

    if (dateOfBirth) {
      const validateDob = this.validateDob(dateOfBirth);
      if (!validateDob) {
        throw new BadRequestException('User must be more than 18 years old');
      }
    }

    if (facultyId) {
      await this.facultyService.getFacultyById(facultyId);
    }

    if (isEmpty(existedUser.id)) {
      throw new BadRequestException('The user does not exist');
    }

    if (password && compareHash(password, existedUser.password)) {
      throw new BadRequestException(
        'The new password must be different from the current one',
      );
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
        address,
        dateOfBirth,
        gender,
        phoneNumber,
        facultyId,
        avatarUrl,
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
      ...selectUser,
    });

    if (users.length !== userIds.length) {
      throw new NotFoundException(`One or more users not found`);
    }

    return users;
  }

  async resetPassword(userId: string) {
    const user = await this.dbContext.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    const password = await this.generatePassword(user.dateOfBirth);

    await this.dbContext.user.update({
      where: {
        id: userId,
      },
      data: {
        password,
      },
    });
  }

  async importUsers(file: Express.Multer.File): Promise<void> {
    if (!file) {
      throw new BadRequestException('Please upload a CSV file.');
    }

    const data = await readXlsxFile(file.filename);
    const users = await this.validateUserXlsx(data);

    await this.dbContext.$transaction(async (trx) => {
      await trx.user.createMany({ data: users });
    });
  }

  async validateUserXlsx(data: string[][]): Promise<CreateUserDto[]> {
    const dto = new ImportUserDto();

    dto.entities = await Promise.all(
      data.map(async (row) => {
        const createUserDto = new CreateUserDto();

        createUserDto.fullName = row[0];
        createUserDto.dateOfBirth = moment(
          row[1],
          'DD/MM/YYYY',
        ).toISOString() as any;

        const existedUser = await this.dbContext.user.findUnique({
          where: { email: row[2] },
        });
        if (existedUser) {
          throw new UnprocessableEntityException(
            `The email: ${existedUser.email} already exists`,
          );
        }

        createUserDto.email = row[2];

        const faculty = await this.dbContext.faculty.findUnique({
          where: { name: row[3] },
        });
        if (!faculty) {
          throw new UnprocessableEntityException(
            `The faculty: ${row[3]} does not exist`,
          );
        }

        createUserDto.facultyId = faculty.id;
        createUserDto.gender = row[4] as Gender;
        createUserDto.address = row[5];
        createUserDto.phoneNumber = row[6];
        createUserDto.type = UserType.STUDENT;
        createUserDto.password = row[1].replace(/\//g, '');

        return createUserDto;
      }),
    );

    const isValidated = await validate(dto, {
      whitelist: true,
      stopAtFirstError: true,
    });

    if (isValidated.length > 0) {
      throw new UnprocessableEntityException(isValidated[0].children);
    }

    return dto.entities;
  }
}
