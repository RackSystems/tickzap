import prisma from '../../config/database';
import { User } from '../interfaces/UserInterface';

export default {
  async findAll() {
    return prisma.user.findMany()
  },

  async create(data: User) {
    return prisma.user.create({ data })
  },

  async update(id: string, data: Partial<Omit<User, 'password'>>) {
    return prisma.user.update({
      where: {id},
      data
    })
  },

  async delete(id: string) {
    return prisma.user.delete({
      where: {id}
    })
  },

  async getById(id: string) {
    return prisma.user.findUnique({
      where: {id}
    })
  }
};
