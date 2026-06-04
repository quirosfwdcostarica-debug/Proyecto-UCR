const UserRepository = require('../repositories/user.repository');

class UserService {
  async findAll() {
    return await UserRepository.findAll();
  }

  async findById(id) {
    return await UserRepository.findById(id);
  }

  async create(data) {
    return await UserRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await UserRepository.update(id, data);
    if (!updated) return null;
    return await UserRepository.findById(id);
  }

  async delete(id) {
    const deleted = await UserRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new UserService();
