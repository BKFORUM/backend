import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/services';
import { GetAllRolesDto, CreateRoleDto, UpdateRoleDto } from './dto';
import { Prisma, Role } from '@prisma/client';
import { getOrderBy, searchByMode } from 'src/common/utils/prisma';
import { Pagination } from 'src/providers';
import { map, omit, pick } from 'lodash';
import _ from 'lodash';

@Injectable()
export class RoleService {
  constructor(private readonly dbContext: PrismaService) {}

  private readonly logger: Logger = new Logger(RoleService.name);

  async getAllRoles({ skip, take, order, search }: GetAllRolesDto) {
    let whereConditions: Prisma.RoleWhereInput = {};
    if (search) {
      whereConditions = {
        OR: [
          {
            description: searchByMode(search),
          },
          {
            name: searchByMode(search),
          },
          {
            displayName: searchByMode(search),
          },
        ],
      };
    }

    let orderBy: Prisma.RoleOrderByWithRelationInput;

    if (order) {
      orderBy = getOrderBy({ defaultValue: 'createdAt', order });
    }

    const [total, roles] = await Promise.all([
      this.dbContext.role.count({
        where: whereConditions,
      }),
      this.dbContext.role.findMany({
        where: whereConditions,
        skip,
        orderBy,
        take,
      }),
    ]);

    const mappedRoles = roles.map((role) =>
      omit(role, 'createdAt', 'updatedAt'),
    );

    return Pagination.of({ take, skip }, total, mappedRoles);
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const { displayName, name, description, permissions } = createRoleDto;

    const foundRole = await this.dbContext.role.findFirst({
      where: { name },
    });

    if (foundRole) {
      throw new BadRequestException('This role name has been used.');
    }

    const filteredPermissions = await this.dbContext.permission.findMany({
      where: { id: { in: [...permissions] } },
    });

    const role = await this.dbContext.role.create({
      data: {
        name: name,
        displayName: displayName,
        description: description,
        permissions: {
          createMany: {
            data: filteredPermissions.map((p) => ({
              permissionId: p.id,
            })),
            skipDuplicates: true,
          },
        },
      },
    });

    this.logger.log('Created a role record', role);

    return role;
  }

  async getRoleById(roleId: string) {
    const role = await this.dbContext.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new BadRequestException("The role doesn't exist");
    }

    return {
      ...pick(
        role,
        'id',
        'name',
        'displayName',
        'description',
        'canBeDeleted',
        'canBeUpdated',
      ),
      permissions: role.permissions.map((x) => x.permission.displayName),
    };
  }

  async deleteRole(roleId: string) {
    const role = await this.dbContext.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new NotFoundException('The requested role does not exist.');
    }

    if (!role.canBeDeleted) {
      throw new BadRequestException('This role cannot be deleted.');
    }

    await this.dbContext.$transaction(async (trx) => {
      await trx.roleToPermission.deleteMany({ where: { roleId: roleId } });
      await trx.userToRole.deleteMany({ where: { roleId: roleId } });
      await trx.role.delete({ where: { id: roleId } });

      this.logger.log({ roleId }, 'deleted role record');
    });
  }

  async updateRole(id: string, roleInfo: UpdateRoleDto) {
    const { permissions } = roleInfo;
    const role = await this.dbContext.role.findUnique({
      where: {
        id,
      },
    });

    if (!role) {
      throw new NotFoundException('The requested role does not exist.');
    }

    if (!role.canBeUpdated)
      throw new BadRequestException('This role cannot be updated.');

    if (role.name !== roleInfo.name) {
      const foundRole = await this.dbContext.role.findFirst({
        where: {
          name: roleInfo.name,
        },
      });

      if (foundRole)
        throw new BadRequestException(
          'A role with given name already exists. Please try again.',
        );
    }

    const filteredPermissions = await this.dbContext.permission.findMany({
      where: { id: { in: [...permissions] } },
    });

    const updatedRole = await this.dbContext.role.update({
      where: {
        id: id,
      },
      data: {
        name: roleInfo.name,
        displayName: roleInfo.name,
        description: roleInfo.description,
        permissions: {
          deleteMany: {
            permissionId: {
              notIn: filteredPermissions.map((x) => x.id),
            },
          },
          createMany: {
            data: filteredPermissions.map((p) => ({
              permissionId: p.id,
            })),
            skipDuplicates: true,
          },
        },
      },
    });

    this.logger.log({ updatedRole }, 'updated role record');
  }

  async checkRoles(roles: string[]) {
    if (!roles) {
      return [];
    }

    const uniqueRoles = [...new Set(roles)];

    if (roles.length !== uniqueRoles.length) {
      return null;
    }

    const existedRoles = await this.dbContext.role.findMany({
      where: {
        id: {
          in: uniqueRoles,
        },
      },
    });

    if (uniqueRoles.length !== existedRoles.length) {
      return null;
    }

    return uniqueRoles;
  }
}
