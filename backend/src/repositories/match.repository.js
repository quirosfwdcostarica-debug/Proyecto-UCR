const db = require('../models');
const Match = db.Match;

class MatchRepository {
  async findAll() {
    return await Match.findAll();
  }

  async findById(id) {
    return await Match.findByPk(id);
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
}

module.exports = new MatchRepository();
