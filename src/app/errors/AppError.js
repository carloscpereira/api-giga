export default class AppError extends Error {
  constructor(statusCode, message) {
    super();
    this.name = 'AppError';
    this.message = message;
    this.statusCode = statusCode;
  }
}
