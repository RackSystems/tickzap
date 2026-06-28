import userService from "@/modules/users/UserService";
import NotFoundException from "@/app/exceptions/NotFoundException";

export default {
  async authenticate(email: string, password: string): Promise<null | string> {
    const user = await userService.show({ email });
    if (!user) {
      return null;
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user.id;
  },

  async me(userId: string): Promise<object> {
    const user = await userService.show({ id: userId });
    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
      isActive: user.isActive,
    };
  },
};
