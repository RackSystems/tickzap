import HttpException from "./HttpException";

export default class ConflictException extends HttpException {
  constructor(message = "Conflito de dados") {
    super(message, 409);
  }
}
