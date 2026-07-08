import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Conexión a la base de datos: EXITOSA!");
  } catch (error) {
    console.error("Conexión FALLIDA:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}
  
main();
