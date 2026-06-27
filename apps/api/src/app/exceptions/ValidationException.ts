import HttpException from "./HttpException";

export type FieldErrors = Record<string, string[]>;

export default class ValidationException extends HttpException {
  readonly errors: FieldErrors;

  constructor(errors: FieldErrors, message = "Dados inválidos") {
    super(message, 422);
    this.errors = errors;
  }
}
