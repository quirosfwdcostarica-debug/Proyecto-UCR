require('dotenv').config();
const db = require('./src/models');

async function dumpAllUsers() {
  await db.sequelize.authenticate();
  
  const users = await db.User.findAll();

  console.log("TODOS LOS USUARIOS EN BACKEND DB:");
  for (const u of users) {
    console.log(`- ID: ${u.id} | Email: ${u.email} | Nombre: ${u.nombre} | Tipo: ${u.tipo}`);
  }
  
  process.exit(0);
}

dumpAllUsers().catch(console.error);
