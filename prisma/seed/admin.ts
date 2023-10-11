import { Gender, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  const saltRounds = Number(process.env.SALT_ROUNDS);
  const salt = await bcrypt.genSalt(saltRounds);
  const password = await bcrypt.hash('123456', salt);
  const adminRoles = await prisma.role.findFirst({
    where: { name: 'ADMIN' },
    select: {
      id: true,
    },
  });
  const ITFaculty = await prisma.faculty.findFirst({
    where: {
      name: 'Công nghệ Thông tin',
    },
    select: {
      id: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      fullName: 'Nguyễn Thành Đạt',
      dateOfBirth: new Date('2002-10-19').toISOString(),
      gender: Gender.MALE,
      password: password,
      roles: {
        create: {
          role: {
            connect: {
              id: adminRoles.id,
            },
          },
        },
      },
      facultyId: ITFaculty.id,
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
