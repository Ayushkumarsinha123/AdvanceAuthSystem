export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // mark this error as an anticipated , operational occurrence
    this.isOperational = true;

    // Capture the stack trace cleanly while keeping our class constructor out of it
    Error.captureStackTrace(this, this.constructor);
  }
}
