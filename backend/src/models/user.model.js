const { DataTypes } = require('sequelize');

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
};