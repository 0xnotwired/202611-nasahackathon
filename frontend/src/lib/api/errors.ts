export class ApiError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`La API respondió con estado ${status}.`);
    this.status = status;
    this.name = "ApiError";
  }
}
