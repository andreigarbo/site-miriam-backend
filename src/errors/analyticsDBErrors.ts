class DBQueryError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, DBQueryError.prototype);
  }
}

class DBWriteError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, DBQueryError.prototype);
  }
}

class DBMalformedDataError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, DBQueryError.prototype);
  }
}

export { DBQueryError, DBWriteError, DBMalformedDataError };
