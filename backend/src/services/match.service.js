const MatchRepository = require('../repositories/match.repository');

class MatchService {
  async findAll() {
    return await MatchRepository.findAll();
  }

  async findById(id) {
    return await MatchRepository.findById(id);
  }

  async create(data) {
    return await MatchRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await MatchRepository.update(id, data);
    if (!updated) return null;
    return await MatchRepository.findById(id);
  }

  async delete(id) {
    const deleted = await MatchRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new MatchService();
