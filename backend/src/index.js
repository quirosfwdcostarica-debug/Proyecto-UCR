require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./config/db');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Setup Routes
app.use('/api', routes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

// Iniciar servidor siempre — la sincronización de BD es opcional al arranque
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Intentar sincronizar BD en background (no bloquea el servidor)
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a base de datos establecida.');
    return sequelize.sync({ alter: false }); // alter:false en producción para no alterar schema
  })
  .then(() => console.log('✅ Modelos sincronizados con la base de datos.'))
  .catch(err => {
    console.warn('⚠️  No se pudo conectar a la BD directamente. El servidor sigue operativo via Supabase REST API.');
    console.warn('   → Para conectar Sequelize, usa la URL del Pooler de Supabase (IPv4, puerto 6543).');
    console.warn('   → Ve a: Supabase Dashboard → Settings → Database → Connection Pooling → Transaction');
    if (process.env.NODE_ENV === 'development') {
      console.warn('   Error:', err.message);
  console.error('\n=== DATABASE ERROR ===');
  console.error(err);
  console.error('======================\n');
    }
  });

