const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const user = await prisma.user.findFirst({
    where: { nombre: { contains: 'Naydelin', mode: 'insensitive' } },
    include: { estudiante: true }
  });
  console.log(JSON.stringify(user, null, 2));
}
run().catch(console.error).finally(() => process.exit(0));
