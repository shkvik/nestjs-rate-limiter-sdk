export class LimiterException extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}
