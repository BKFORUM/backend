import { Prisma } from '@prisma/client';

export const searchByMode = (
  search?: string,
  mode: Prisma.QueryMode = Prisma.QueryMode.insensitive,
): Prisma.StringFilter | undefined => {
  return search ? { contains: search, mode } : undefined;
};

export const getOrderBy = (defaultValue: string, order?: string) => {
  if (!order) {
    return {
      [defaultValue]: Prisma.SortOrder.asc,
    };
  }

  const [field, direction] = order.split(':');
  return {
    [field]: direction,
  };
};
