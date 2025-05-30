import UserRepository from '../repositories/UserRepository';
import bcrypt from 'bcrypt';

export default {
  async authenticate(email: string, password: string): Promise<string> {
    const user = await UserRepository.findByEmail(email)
    if (!user) {
      throw new Error('Falha ao autenticar')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Falha ao autenticar')
    }

    return user.id
  },

  async me(userId: string): Promise<Object> {
    const user = await UserRepository.getById(userId)

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
      isActive: user.isActive
    }
  }
}
