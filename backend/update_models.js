const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'models');

const modelsData = {
  'user.model.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.TEXT, unique: true, allowNull: false },
    nombre: { type: DataTypes.TEXT, allowNull: false },
    tipo: { type: DataTypes.TEXT }, // ej: 'EXALUMNO', 'ESTUDIANTE'
    email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    foto_url: { type: DataTypes.TEXT },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    reportes_recibidos: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, {
    tableName: 'USERS',
    timestamps: true,
    underscored: true
  });

  User.associate = (models) => {
    User.hasOne(models.Exalumno, { foreignKey: 'user_id' });
    User.hasOne(models.Estudiante, { foreignKey: 'user_id' });
  };

  return User;
};`,

  'exalumno.model.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Exalumno = sequelize.define('Exalumno', {
    user_id: { type: DataTypes.UUID, primaryKey: true, references: { model: 'USERS', key: 'id' } },
    carnet_ucr: { type: DataTypes.TEXT },
    escuela_facultad: { type: DataTypes.TEXT },
    anio_graduacion: { type: DataTypes.INTEGER },
    empresa_actual: { type: DataTypes.TEXT },
    cargo_actual: { type: DataTypes.TEXT },
    pais_ciudad: { type: DataTypes.TEXT },
    anios_experiencia: { type: DataTypes.INTEGER },
    linkedin_url: { type: DataTypes.TEXT },
    ofrece_mentoria: { type: DataTypes.BOOLEAN, defaultValue: false },
    ofrece_empleo: { type: DataTypes.BOOLEAN, defaultValue: false },
    ofrece_pasantia: { type: DataTypes.BOOLEAN, defaultValue: false },
    ofrece_proyecto: { type: DataTypes.BOOLEAN, defaultValue: false },
    ofrece_donacion_dinero: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'EXALUMNOS',
    timestamps: false,
    underscored: true
  });

  Exalumno.associate = (models) => {
    Exalumno.belongsTo(models.User, { foreignKey: 'user_id' });
    Exalumno.hasMany(models.Match, { foreignKey: 'exalumno_id' });
    Exalumno.hasMany(models.Donacion, { foreignKey: 'exalumno_id' });
    Exalumno.hasMany(models.Posicion, { foreignKey: 'exalumno_id' });
  };

  return Exalumno;
};`,

  'estudiante.model.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Estudiante = sequelize.define('Estudiante', {
    user_id: { type: DataTypes.UUID, primaryKey: true, references: { model: 'USERS', key: 'id' } },
    carnet_ucr: { type: DataTypes.TEXT },
    carrera: { type: DataTypes.TEXT },
    escuela_facultad: { type: DataTypes.TEXT },
    sede: { type: DataTypes.TEXT },
    anio_ingreso: { type: DataTypes.INTEGER },
    nivel_academico: { type: DataTypes.TEXT },
    promedio_ponderado: { type: DataTypes.DECIMAL },
    proyecto_titulo: { type: DataTypes.TEXT },
    proyecto_tipo: { type: DataTypes.TEXT },
    busca_financiamiento: { type: DataTypes.BOOLEAN, defaultValue: false },
    busca_mentoria: { type: DataTypes.BOOLEAN, defaultValue: false },
    busca_empleo: { type: DataTypes.BOOLEAN, defaultValue: false },
    busca_pasantia: { type: DataTypes.BOOLEAN, defaultValue: false },
    nivel_beca: { type: DataTypes.TEXT }
  }, {
    tableName: 'ESTUDIANTES',
    timestamps: false,
    underscored: true
  });

  Estudiante.associate = (models) => {
    Estudiante.belongsTo(models.User, { foreignKey: 'user_id' });
    Estudiante.hasMany(models.Match, { foreignKey: 'estudiante_id' });
    Estudiante.hasMany(models.Donacion, { foreignKey: 'proyecto_estudiante_id' });
    Estudiante.hasOne(models.Curriculum, { foreignKey: 'estudiante_id' });
    Estudiante.hasMany(models.Aplicacion, { foreignKey: 'estudiante_id' });
  };

  return Estudiante;
};`,

  'match.model.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Match = sequelize.define('Match', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    exalumno_id: { type: DataTypes.UUID, allowNull: false },
    estudiante_id: { type: DataTypes.UUID, allowNull: false },
    tipo_apoyo: { type: DataTypes.TEXT },
    score_match: { type: DataTypes.INTEGER },
    estado: { type: DataTypes.TEXT },
    resultado: { type: DataTypes.TEXT }
  }, {
    tableName: 'MATCHES',
    timestamps: true,
    underscored: true
  });

  Match.associate = (models) => {
    Match.belongsTo(models.Exalumno, { foreignKey: 'exalumno_id' });
    Match.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id' });
  };

  return Match;
};`,

  'donacion.model.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Donacion = sequelize.define('Donacion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    exalumno_id: { type: DataTypes.UUID, allowNull: false },
    proyecto_estudiante_id: { type: DataTypes.UUID, allowNull: false },
    monto: { type: DataTypes.DECIMAL },
    moneda: { type: DataTypes.TEXT },
    metodo_pago: { type: DataTypes.TEXT },
    estado: { type: DataTypes.TEXT },
    confirmado_por: { type: DataTypes.UUID }
  }, {
    tableName: 'DONACIONES',
    timestamps: true,
    underscored: true
  });

  Donacion.associate = (models) => {
    Donacion.belongsTo(models.Exalumno, { foreignKey: 'exalumno_id' });
    Donacion.belongsTo(models.Estudiante, { foreignKey: 'proyecto_estudiante_id' });
  };

  return Donacion;
};`,

  'reporteperfil.model.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReportePerfil = sequelize.define('ReportePerfil', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    reportado_por: { type: DataTypes.UUID, allowNull: false },
    perfil_reportado: { type: DataTypes.UUID, allowNull: false },
    motivo: { type: DataTypes.TEXT },
    resuelto: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'REPORTES_PERFIL',
    timestamps: true,
    underscored: true
  });

  ReportePerfil.associate = (models) => {
    ReportePerfil.belongsTo(models.User, { foreignKey: 'reportado_por', as: 'Reporter' });
    ReportePerfil.belongsTo(models.User, { foreignKey: 'perfil_reportado', as: 'Reported' });
  };

  return ReportePerfil;
};`,

  'curriculum.model.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Curriculum = sequelize.define('Curriculum', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    estudiante_id: { type: DataTypes.UUID, allowNull: false },
    habilidades_tecnicas: { type: DataTypes.JSONB },
    idiomas: { type: DataTypes.JSONB }
  }, {
    tableName: 'CURRICULUM',
    timestamps: true,
    underscored: true
  });

  Curriculum.associate = (models) => {
    Curriculum.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id' });
    Curriculum.hasMany(models.CurriculumExperiencia, { foreignKey: 'curriculum_id' });
    Curriculum.hasMany(models.CurriculumCertificacion, { foreignKey: 'curriculum_id' });
    Curriculum.hasMany(models.CurriculumVersion, { foreignKey: 'curriculum_id' });
  };

  return Curriculum;
};`,

  'curriculumexperiencia.model.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CurriculumExperiencia = sequelize.define('CurriculumExperiencia', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    curriculum_id: { type: DataTypes.UUID, allowNull: false },
    tipo: { type: DataTypes.TEXT },
    titulo: { type: DataTypes.TEXT },
    organizacion: { type: DataTypes.TEXT }
  }, {
    tableName: 'CURRICULUM_EXPERIENCIA',
    timestamps: false,
    underscored: true
  });

  CurriculumExperiencia.associate = (models) => {
    CurriculumExperiencia.belongsTo(models.Curriculum, { foreignKey: 'curriculum_id' });
  };

  return CurriculumExperiencia;
};`,

  'curriculumcertificacion.model.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CurriculumCertificacion = sequelize.define('CurriculumCertificacion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    curriculum_id: { type: DataTypes.UUID, allowNull: false },
    nombre: { type: DataTypes.TEXT },
    institucion: { type: DataTypes.TEXT }
  }, {
    tableName: 'CURRICULUM_CERTIFICACIONES',
    timestamps: false,
    underscored: true
  });

  CurriculumCertificacion.associate = (models) => {
    CurriculumCertificacion.belongsTo(models.Curriculum, { foreignKey: 'curriculum_id' });
  };

  return CurriculumCertificacion;
};`,

  'posicion.model.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Posicion = sequelize.define('Posicion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    exalumno_id: { type: DataTypes.UUID, allowNull: false },
    tipo: { type: DataTypes.TEXT },
    titulo: { type: DataTypes.TEXT },
    modalidad: { type: DataTypes.TEXT },
    jornada: { type: DataTypes.TEXT },
    empresa: { type: DataTypes.TEXT },
    fecha_limite: { type: DataTypes.DATE },
    estado: { type: DataTypes.TEXT }
  }, {
    tableName: 'POSICIONES',
    timestamps: true,
    underscored: true
  });

  Posicion.associate = (models) => {
    Posicion.belongsTo(models.Exalumno, { foreignKey: 'exalumno_id' });
    Posicion.hasMany(models.Aplicacion, { foreignKey: 'posicion_id' });
    Posicion.hasMany(models.CurriculumVersion, { foreignKey: 'posicion_id' });
  };

  return Posicion;
};`,

  'curriculumversion.model.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CurriculumVersion = sequelize.define('CurriculumVersion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    curriculum_id: { type: DataTypes.UUID, allowNull: false },
    posicion_id: { type: DataTypes.UUID },
    nombre_version: { type: DataTypes.TEXT }
  }, {
    tableName: 'CURRICULUM_VERSIONES',
    timestamps: true,
    underscored: true
  });

  CurriculumVersion.associate = (models) => {
    CurriculumVersion.belongsTo(models.Curriculum, { foreignKey: 'curriculum_id' });
    CurriculumVersion.belongsTo(models.Posicion, { foreignKey: 'posicion_id' });
    CurriculumVersion.hasMany(models.Aplicacion, { foreignKey: 'curriculum_version_id' });
  };

  return CurriculumVersion;
};`,

  'aplicacion.model.js': `const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Aplicacion = sequelize.define('Aplicacion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    posicion_id: { type: DataTypes.UUID, allowNull: false },
    estudiante_id: { type: DataTypes.UUID, allowNull: false },
    curriculum_version_id: { type: DataTypes.UUID },
    estado: { type: DataTypes.TEXT }
  }, {
    tableName: 'APLICACIONES',
    timestamps: true,
    underscored: true
  });

  Aplicacion.associate = (models) => {
    Aplicacion.belongsTo(models.Posicion, { foreignKey: 'posicion_id' });
    Aplicacion.belongsTo(models.Estudiante, { foreignKey: 'estudiante_id' });
    Aplicacion.belongsTo(models.CurriculumVersion, { foreignKey: 'curriculum_version_id' });
  };

  return Aplicacion;
};`

};

Object.keys(modelsData).forEach(filename => {
  fs.writeFileSync(path.join(modelsDir, filename), modelsData[filename]);
});

console.log('Models updated with specific fields and associations.');
