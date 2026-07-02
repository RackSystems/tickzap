import { DomainError } from "@/shared/errors";

export class UserNotFoundError extends DomainError {
  readonly status = 404;

  constructor(message = "Usuário não encontrado") {
    super(message);
    this.name = "UserNotFoundError";
  }
}

export class EmailAlreadyInUseError extends DomainError {
  readonly status = 409;

  constructor(message = "Esse email já está em uso") {
    super(message);
    this.name = "EmailAlreadyInUseError";
  }
}

export class CannotDeleteActiveUserError extends DomainError {
  readonly status = 400;

  constructor(message = "Usuário ativo, desative antes de excluir") {
    super(message);
    this.name = "CannotDeleteActiveUserError";
  }
}
