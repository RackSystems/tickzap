export abstract class DomainError extends Error {
  abstract readonly status: number;
}
