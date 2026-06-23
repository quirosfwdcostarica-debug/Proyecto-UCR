const { PrismaClient } = require('@prisma/client');

async function testWithEnv(databaseUrl, directUrl, label) {
  process.env.DATABASE_URL = databaseUrl;
  if (directUrl) {
    process.env.DIRECT_URL = directUrl;
  } else {
    delete process.env.DIRECT_URL;
  }
  
  console.log(`\n--- Testing Prisma with ${label} ---`);
  console.log(`DATABASE_URL: ${databaseUrl.replace(/:[^:@]+@/, ':***@')}`);
  if (directUrl) {
    console.log(`DIRECT_URL: ${directUrl.replace(/:[^:@]+@/, ':***@')}`);
  }

  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({ take: 1 });
    console.log(`✅ SUCCESS! Found users:`, users.length);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    await prisma.$disconnect();
    return false;
  }
}

async function main() {
  const dbUrlPooled = "postgresql://postgres.cpbskmydhtdtutplxozq:ProyectoUCR@aws-1-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
  
  // Option A: DIRECT_URL same as DATABASE_URL but without pgbouncer=true
  const directUrlSession = "postgresql://postgres.cpbskmydhtdtutplxozq:ProyectoUCR@aws-1-us-west-1.pooler.supabase.com:5432/postgres";
  await testWithEnv(dbUrlPooled, directUrlSession, "Option A (DIRECT_URL = pooler port 5432)");

  // Option B: Both URLs pointing to port 6543 (pooled)
  const directUrlPooled = "postgresql://postgres.cpbskmydhtdtutplxozq:ProyectoUCR@aws-1-us-west-1.pooler.supabase.com:6543/postgres";
  await testWithEnv(dbUrlPooled, directUrlPooled, "Option B (DIRECT_URL = pooler port 6543)");
}

main();
