require('dotenv').config();
const db = require('./src/models');

async function dumpExalumnos() {
  await db.sequelize.authenticate();
  
  const users = await db.User.findAll({
    where: { tipo: 'EXALUMNO' }
  });

  console.log("EXALUMNOS EN BACKEND DB:");
  for (const u of users) {
    console.log(`- ID: ${u.id} | Email: ${u.email} | Nombre: ${u.nombre}`);
  }
  
  process.exit(0);
}

dumpExalumnos().catch(console.error);
