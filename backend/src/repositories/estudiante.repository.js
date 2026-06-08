const db = require('../models');
const Estudiante = db.Estudiante;

class EstudianteRepository {
  async findAll() {
    return await Estudiante.findAll();
  }

  async findById(id) {
    return await Estudiante.findByPk(id);
  }

  async create(data) {
    return await Estudiante.create(data);
  }

  async update(id, data) {
    return await Estudiante.update(data, { where: { id } });
  }

  async delete(id) {
    return await Estudiante.destroy({ where: { id } });
  }
}

module.exports = new EstudianteRepository();
