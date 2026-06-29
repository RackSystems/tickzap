export class UserNotFoundError extends Error {
  constructor(message = "Usuário não encontrado") {
    super(message);
    this.name = "UserNotFoundError";
  }
}

export class EmailAlreadyInUseError extends Error {
  constructor(message = "Esse email já está em uso") {
    super(message);
    this.name = "EmailAlreadyInUseError";
  }
}

export class CannotDeleteActiveUserError extends Error {
  constructor(message = "Usuário ativo, desative antes de excluir") {
    super(message);
    this.name = "CannotDeleteActiveUserError";
  }
}
