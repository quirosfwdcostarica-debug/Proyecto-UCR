const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Match = sequelize.define('Match', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    exalumno_id: { type: DataTypes.UUID, allowNull: false },
    estudiante_id: { type: DataTypes.UUID, allowNull: false },
    tipo_apoyo: { type: DataTypes.TEXT },
    score_match: { type: DataTypes.INTEGER },
    estado: { type: DataTypes.TEXT, defaultValue: 'SUGERIDO' },
    initiated_by: { type: DataTypes.TEXT },
    match_reasons: { type: DataTypes.JSONB },
    accepted_at: { type: DataTypes.DATE },
    rejected_at: { type: DataTypes.DATE },
    closed_at: { type: DataTypes.DATE },
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
};