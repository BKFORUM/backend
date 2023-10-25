import { Prisma } from '@prisma/client';
import { set } from 'lodash';

export const searchByMode = (
  search?: string,
  mode: Prisma.QueryMode = Prisma.QueryMode.insensitive,
): Prisma.StringFilter | undefined => {
  return search ? { contains: search, mode } : undefined;
};

export const getOrderBy = <T>(option: {
  defaultValue: keyof T;
  order?: string;
  mappedOrder?: any;
}) => {
  const { defaultValue, order, mappedOrder } = option;
  if (!order) {
    return {
      [defaultValue]: Prisma.SortOrder.asc,
    };
  }

  const [field, direction] = order.split(':');

  const mappedField =
    mappedOrder && Object.keys(mappedOrder).includes(field)
      ? mappedOrder[`${field}`]
      : field;
  const [, ...property] = mappedField.split('.');

  if (property.length > 0) {
    return set({}, mappedField, direction);
  }

  return {
    [field]: direction,
  };
};
