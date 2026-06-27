import HttpException from "./HttpException";

export default class NotFoundException extends HttpException {
  constructor(message = "Recurso não encontrado") {
    super(message, 404);
  }
}
