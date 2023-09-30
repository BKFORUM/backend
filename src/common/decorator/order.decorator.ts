import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { registerDecorator, ValidationOptions } from 'class-validator';

const isEnumValue = (enumType, value) => {
  return Object.values(enumType).includes(value);
};

export const isValidOrder = (
  field: string,
  orderDirection: string,
  orderFieldEnumType: any,
) => {
  if (!isEnumValue(orderFieldEnumType, field))
    throw new BadRequestException(
      `orderField must be in: ${Object.values(
        orderFieldEnumType,
      )}. Your value: '${field}'`,
    );

  if (!isEnumValue(Prisma.SortOrder, orderDirection))
    throw new BadRequestException(
      `orderDirection must be in: ${Object.values(
        Prisma.SortOrder,
      )}. Your value: '${orderDirection}'`,
    );

  return true;
};

export const IsOrderQueryParam = (
  property: string,
  orderFieldEnumType: any,
  validationOptions?: ValidationOptions,
) => {
  return function (object, propertyName: string) {
    registerDecorator({
      name: 'IsOrderQueryParam',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const [field, orderDirection] = value.split(':');

          return isValidOrder(field, orderDirection, orderFieldEnumType);
        },
      },
    });
  };
};
