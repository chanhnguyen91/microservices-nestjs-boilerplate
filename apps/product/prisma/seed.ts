import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.products.createMany({
    data: [
      { name: 'Laptop', price: 1000, stock: 50 },
      { name: 'Phone', price: 500, stock: 100 },
      { name: 'Tablet', price: 300, stock: 75 },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
