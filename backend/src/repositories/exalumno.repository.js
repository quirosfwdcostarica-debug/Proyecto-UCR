const db = require('../models');
const Exalumno = db.Exalumno;

class ExalumnoRepository {
  async findAll() {
    return await Exalumno.findAll({
      include: [{
        model: db.User,
        required: true
      }]
    });
  }

  async findById(id) {
    return await Exalumno.findByPk(id);
  }

  async create(data) {
    return await Exalumno.create(data);
  }

  async update(id, data) {
    return await Exalumno.update(data, { where: { user_id: id } });
  }

  async delete(id) {
    return await Exalumno.destroy({ where: { user_id: id } });
  }
}

module.exports = new ExalumnoRepository();
