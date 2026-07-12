import { DomainError } from "@/shared/errors";

export class InvalidCredentialsError extends DomainError {
  readonly status = 401;

  constructor(message = "Email ou senha inválidos") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}

export class UnauthenticatedError extends DomainError {
  readonly status = 401;

  constructor(
    message = "Você precisa estar autenticado para acessar este recurso",
  ) {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

export class TooManySignInAttemptsError extends DomainError {
  readonly status = 429;

  constructor(message = "Muitas tentativas de login. Tente novamente em breve") {
    super(message);
    this.name = "TooManySignInAttemptsError";
  }
}

export class UntrustedOriginError extends DomainError {
  readonly status = 403;

  constructor(message = "Origem da requisição não permitida") {
    super(message);
    this.name = "UntrustedOriginError";
  }
}
