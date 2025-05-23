import prisma from '../../config/database';
import { User } from '../interfaces/UserInterface';

export default {
  async findAll() {
    return prisma.user.findMany();
  },

  async create(data: User) {
    return prisma.user.create({ data });
  },
};
