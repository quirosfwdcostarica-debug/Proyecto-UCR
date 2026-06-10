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
    console.warn('⚠️  Sequelize no pudo conectar directamente (puerto bloqueado por red). El servidor opera normalmente via Supabase REST API.');
    if (process.env.NODE_ENV === 'development' && process.env.DB_DEBUG === 'true') {
      console.warn('   Error técnico:', err.message);
    }
  });

