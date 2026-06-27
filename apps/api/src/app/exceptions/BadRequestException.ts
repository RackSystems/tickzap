import HttpException from "./HttpException";

export default class BadRequestException extends HttpException {
  constructor(message = "Requisição inválida") {
    super(message, 400);
  }
}
