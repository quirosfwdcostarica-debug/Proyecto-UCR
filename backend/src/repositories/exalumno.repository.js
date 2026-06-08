const db = require('../models');
const Exalumno = db.Exalumno;

class ExalumnoRepository {
  async findAll() {
    return await Exalumno.findAll();
  }

  async findById(id) {
    return await Exalumno.findByPk(id);
  }

  async create(data) {
    return await Exalumno.create(data);
  }

  async update(id, data) {
    return await Exalumno.update(data, { where: { id } });
  }

  async delete(id) {
    return await Exalumno.destroy({ where: { id } });
  }
}

module.exports = new ExalumnoRepository();
