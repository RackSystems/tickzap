import UserRepository from '../repositories/UserRepository'
import { User } from '../interfaces/UserInterface'

export default {
  async getAll() {
    return UserRepository.findAll();
  },

  async create(data: User) {
    return await UserRepository.create(data)
  }
}
