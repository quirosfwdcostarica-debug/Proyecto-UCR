const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const dirs = ['models', 'controllers', 'routes', 'middlewares'];

dirs.forEach(d => {
  const p = path.join(srcDir, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const entities = [
  { name: 'User', modelName: 'User', tableName: 'USERS', routeName: 'users' },
  { name: 'Exalumno', modelName: 'Exalumno', tableName: 'EXALUMNOS', routeName: 'exalumnos' },
  { name: 'Estudiante', modelName: 'Estudiante', tableName: 'ESTUDIANTES', routeName: 'estudiantes' },
  { name: 'Match', modelName: 'Match', tableName: 'MATCHES', routeName: 'matches' },
  { name: 'Donacion', modelName: 'Donacion', tableName: 'DONACIONES', routeName: 'donaciones' },
  { name: 'ReportePerfil', modelName: 'ReportePerfil', tableName: 'REPORTES_PERFIL', routeName: 'reportes-perfil' },
  { name: 'Curriculum', modelName: 'Curriculum', tableName: 'CURRICULUM', routeName: 'curriculum' },
  { name: 'CurriculumExperiencia', modelName: 'CurriculumExperiencia', tableName: 'CURRICULUM_EXPERIENCIA', routeName: 'curriculum-experiencia' },
  { name: 'CurriculumCertificacion', modelName: 'CurriculumCertificacion', tableName: 'CURRICULUM_CERTIFICACIONES', routeName: 'curriculum-certificacion' },
  { name: 'Posicion', modelName: 'Posicion', tableName: 'POSICIONES', routeName: 'posiciones' },
  { name: 'CurriculumVersion', modelName: 'CurriculumVersion', tableName: 'CURRICULUM_VERSIONES', routeName: 'curriculum-versiones' },
  { name: 'Aplicacion', modelName: 'Aplicacion', tableName: 'APLICACIONES', routeName: 'aplicaciones' }
];

// Generate Models
entities.forEach(entity => {
  const modelCode = `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ${entity.modelName} = sequelize.define('${entity.modelName}', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Añade los campos específicos de la tabla aquí basados en tu diagrama ER
  }, {
    tableName: '${entity.tableName}',
    timestamps: true, // Asumiendo created_at / updated_at
    underscored: true
  });

  ${entity.modelName}.associate = (models) => {
    // Definir asociaciones aquí (ej: belongsTo, hasMany)
  };

  return ${entity.modelName};
};
`;
  fs.writeFileSync(path.join(srcDir, 'models', `${entity.name.toLowerCase()}.model.js`), modelCode);
});

// Generate models/index.js
const modelsIndexCode = `const { sequelize } = require('../config/db');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const db = {};

fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
`;
fs.writeFileSync(path.join(srcDir, 'models', 'index.js'), modelsIndexCode);

// Generate Controllers
entities.forEach(entity => {
  const controllerCode = `const db = require('../models');
const ${entity.modelName} = db.${entity.modelName};

exports.findAll = async (req, res, next) => {
  try {
    const data = await ${entity.modelName}.findAll();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.findById = async (req, res, next) => {
  try {
    const data = await ${entity.modelName}.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await ${entity.modelName}.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const [updated] = await ${entity.modelName}.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    const updatedData = await ${entity.modelName}.findByPk(req.params.id);
    res.status(200).json(updatedData);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const deleted = await ${entity.modelName}.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
`;
  fs.writeFileSync(path.join(srcDir, 'controllers', `${entity.name.toLowerCase()}.controller.js`), controllerCode);
});

// Generate Routes
entities.forEach(entity => {
  const routeCode = `const express = require('express');
const router = express.Router();
const controller = require('../controllers/${entity.name.toLowerCase()}.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Descomenta verifyToken si quieres proteger las rutas
router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', /*verifyToken,*/ controller.create);
router.put('/:id', /*verifyToken,*/ controller.update);
router.delete('/:id', /*verifyToken,*/ controller.delete);

module.exports = router;
`;
  fs.writeFileSync(path.join(srcDir, 'routes', `${entity.name.toLowerCase()}.routes.js`), routeCode);
});

// Generate index.routes.js
let indexRoutesCode = `const express = require('express');
const router = express.Router();\n\n`;
entities.forEach(entity => {
  indexRoutesCode += `router.use('/${entity.routeName}', require('./${entity.name.toLowerCase()}.routes'));\n`;
});
indexRoutesCode += `\nmodule.exports = router;\n`;
fs.writeFileSync(path.join(srcDir, 'routes', 'index.js'), indexRoutesCode);

// Generate Middlewares
const authMiddlewareCode = `const { supabase } = require('../config/db');

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ message: 'Unauthorized', error: error?.message });
    }

    req.user = data.user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Auth middleware error', error: error.message });
  }
};
`;
fs.writeFileSync(path.join(srcDir, 'middlewares', 'auth.middleware.js'), authMiddlewareCode);

const errorMiddlewareCode = `exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};
`;
fs.writeFileSync(path.join(srcDir, 'middlewares', 'error.middleware.js'), errorMiddlewareCode);

// Generate index.js (server)
const indexJsCode = `const express = require('express');
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

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(\`Server is running on port \${PORT}\`);
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});
`;
fs.writeFileSync(path.join(srcDir, 'index.js'), indexJsCode);

console.log('Backend scaffolded successfully.');
