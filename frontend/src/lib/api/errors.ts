export class ApiError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`The API responded with status ${status}.`);
    this.status = status;
    this.name = "ApiError";
  }
}
