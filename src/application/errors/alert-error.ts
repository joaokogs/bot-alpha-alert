export class AlertError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'AlertError';
  }
}

export class ScrapingError extends AlertError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'ScrapingError';
  }
}

export class ParseError extends AlertError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'ParseError';
  }
}
