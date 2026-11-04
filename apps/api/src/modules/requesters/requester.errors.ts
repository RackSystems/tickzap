import { DomainError } from "@/shared/errors";

export class RequesterNotFoundError extends DomainError {
  readonly status = 404;

  constructor(message = "Solicitante não encontrado") {
    super(message);
    this.name = "RequesterNotFoundError";
  }
}
