process.env.DATABASE_URL = "postgresql://postgres.cpbskmydhtdtutplxozq:ProyectoUCR@aws-1-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
process.env.DIRECT_URL = "postgresql://postgres.cpbskmydhtdtutplxozq:ProyectoUCR@aws-1-us-west-1.pooler.supabase.com:6543/postgres";

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("DIRECT_URL:", process.env.DIRECT_URL);

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      take: 5
    });
    console.log("Prisma users query succeeded!");
    users.forEach(u => console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.nombre}, Tipo: ${u.tipo}, Status: ${u.status}, Activo: ${u.activo}`));
  } catch (error) {
    console.error("Prisma query failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
