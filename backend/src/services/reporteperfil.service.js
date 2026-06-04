const ReporteperfilRepository = require('../repositories/reporteperfil.repository');

class ReporteperfilService {
  async findAll() {
    return await ReporteperfilRepository.findAll();
  }

  async findById(id) {
    return await ReporteperfilRepository.findById(id);
  }

  async create(data) {
    return await ReporteperfilRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await ReporteperfilRepository.update(id, data);
    if (!updated) return null;
    return await ReporteperfilRepository.findById(id);
  }

  async delete(id) {
    const deleted = await ReporteperfilRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new ReporteperfilService();
