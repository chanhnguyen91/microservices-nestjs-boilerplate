import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.auth_permissions.createMany({
    data: [
      { name: 'manage:users' },
      { name: 'manage:roles' },
      { name: 'manage:permissions' },
      { name: 'create:products' },
      { name: 'read:products' },
      { name: 'update:products' },
      { name: 'delete:products' },
    ],
    skipDuplicates: true,
  });

  const adminRole = await prisma.auth_roles.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  });
  const managerRole = await prisma.auth_roles.upsert({
    where: { name: 'Manager' },
    update: {},
    create: { name: 'Manager' },
  });
  const employeeRole = await prisma.auth_roles.upsert({
    where: { name: 'Employee' },
    update: {},
    create: { name: 'Employee' },
  });

  await prisma.auth_roles.update({
    where: { id: adminRole.id },
    data: {
      permissions: {
        connect: [
          { name: 'manage:users' },
          { name: 'manage:roles' },
          { name: 'manage:permissions' },
          { name: 'create:products' },
          { name: 'read:products' },
          { name: 'update:products' },
          { name: 'delete:products' },
        ],
      },
    },
  });
  await prisma.auth_roles.update({
    where: { id: managerRole.id },
    data: {
      permissions: {
        connect: [
          { name: 'create:products' },
          { name: 'read:products' },
          { name: 'update:products' },
          { name: 'delete:products' },
        ],
      },
    },
  });
  await prisma.auth_roles.update({
    where: { id: employeeRole.id },
    data: {
      permissions: {
        connect: [{ name: 'read:products' }],
      },
    },
  });

  await prisma.auth_users.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashSync('password', 10),
      roleId: adminRole.id,
      status: 'active',
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
