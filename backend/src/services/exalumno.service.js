const ExalumnoRepository = require('../repositories/exalumno.repository');

class ExalumnoService {
  async findAll() {
    return await ExalumnoRepository.findAll();
  }

  async findById(id) {
    return await ExalumnoRepository.findById(id);
  }

  async create(data) {
    return await ExalumnoRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await ExalumnoRepository.update(id, data);
    if (!updated) return null;
    return await ExalumnoRepository.findById(id);
  }

  async delete(id) {
    const deleted = await ExalumnoRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new ExalumnoService();
