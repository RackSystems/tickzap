import UserRepository from '../repositories/UserRepository'
import { User } from '../interfaces/UserInterface'

export default {
  //TODO criar um helper para nao trazer o password nas responses

  async getAll() {
    return UserRepository.findAll();
  },

  async create(data: User) {
    return await UserRepository.create(data)
  },

  async update(id: string, data: Partial<Omit<User, 'password'>>) {
    return await UserRepository.update(id, data)
  },

  async delete(id: string) {
    //TODO - apagar apenas usuarios inativos
    return await UserRepository.delete(id)
  },

  async getById(id: string) {
    return await UserRepository.getById(id)
  }

  //TODO metodo de alterar status e ativar/desativar usuario
}
