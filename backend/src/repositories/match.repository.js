const db = require('../models');
const Match = db.Match;
const { Op } = require('sequelize');

class MatchRepository {
  async findAll() {
    return await Match.findAll({
      include: [
        { model: db.Estudiante, include: [db.User] },
        { model: db.Exalumno, include: [db.User] }
      ]
    });
  }

  async findByUserId(userId, role) {
    if (role === 'ESTUDIANTE') {
      return await Match.findAll({
        where: { estudiante_id: userId, score_match: { [Op.gt]: 0 } },
        order: [['score_match', 'DESC']],
        include: [{ model: db.Exalumno, include: [{ model: db.User, attributes: ['id', 'nombre', 'email', 'foto_url'] }] }]
      });
    } else if (role === 'EXALUMNO') {
      return await Match.findAll({
        where: { exalumno_id: userId, score_match: { [Op.gt]: 0 } },
        order: [['score_match', 'DESC']],
        include: [{ model: db.Estudiante, include: [{ model: db.User, attributes: ['id', 'nombre', 'email', 'foto_url'] }] }]
      });
    }
    return [];
  }

  async findById(id) {
    return await Match.findByPk(id, {
      include: [
        { model: db.Estudiante, include: [db.User] },
        { model: db.Exalumno, include: [db.User] }
      ]
    });
  }

  async findByPair(estudianteId, exalumnoId) {
    return await Match.findOne({
      where: { estudiante_id: estudianteId, exalumno_id: exalumnoId }
    });
  }

  async create(data) {
    return await Match.create(data);
  }

  async update(id, data) {
    return await Match.update(data, { where: { id } });
  }

  async delete(id) {
    return await Match.destroy({ where: { id } });
  }

  async getMetrics() {
    const totalSugeridos = await Match.count({ where: { estado: 'SUGERIDO' } });
    const totalActivos = await Match.count({ where: { estado: 'ACTIVO' } });
    const totalRechazados = await Match.count({ where: { estado: 'RECHAZADO' } });
    
    // Tasa de aceptación (Activos / (Activos + Rechazados))
    const totalDecididos = totalActivos + totalRechazados;
    const tasaAceptacion = totalDecididos > 0 ? (totalActivos / totalDecididos) * 100 : 0;

    // Promedio score
    const avgScore = await Match.aggregate('score_match', 'AVG', { where: { score_match: { [Op.gt]: 0 } } });

    return {
      totalSugeridos,
      totalActivos,
      totalRechazados,
      tasaAceptacion: Math.round(tasaAceptacion),
      promedioScore: avgScore ? Math.round(avgScore) : 0
    };
  }
}

module.exports = new MatchRepository();
