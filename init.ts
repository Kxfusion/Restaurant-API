import { Item, PrismaClient } from '@prisma/client'
import data from './menu.json';

const prisma = new PrismaClient()

async function main() {
  for (const piece of data) {
    console.log(piece);
    await prisma.item.create({ data: piece as Item});
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })