class DBQueryError extends Error {
  constructor() {
    super();
    this.name = 'DBQueryError';
    this.status = 500;
    this.message = 'Error querying Database';
    Object.setPrototypeOf(this, DBQueryError.prototype);
  }
}

class DBWriteError extends Error {
  constructor() {
    super();
    this.name = 'DBWriteError';
    this.status = 500;
    this.message = 'Error writing Database';
    Object.setPrototypeOf(this, DBQueryError.prototype);
  }
}

class DBMalformedDataError extends Error {
  constructor() {
    super();
    this.name = 'DBMalformedDataError';
    this.status = 500;
    this.message = 'Malformed data in Database';
    Object.setPrototypeOf(this, DBMalformedDataError.prototype);
  }
}

class DBNonExistentEntryError extends Error {
  constructor() {
    super();
    this.name = 'DBNonExistentEntryError';
    this.status = 400;
    this.message = 'Database entry does not exist';
    Object.setPrototypeOf(this, DBNonExistentEntryError.prototype);
  }
}

class RequestMissingDataError extends Error {
  constructor(field: string) {
    super();
    this.name = 'RequestMissingDataError';
    this.status = 400;
    this.message = 'Missing field ' + field + ' on request';
    Object.setPrototypeOf(this, RequestMissingDataError.prototype);
  }
}

class RequestInvalidDataError extends Error {
  constructor(field: string) {
    super();
    this.name = 'RequestInvalidDataError';
    this.status = 400;
    this.message = 'Invalid value for field ' + field;
    Object.setPrototypeOf(this, RequestInvalidDataError.prototype);
  }
}

class InternalServerError extends Error {
  constructor() {
    super();
    this.name = 'InternalServerError';
    this.status = 500;
    this.message = 'Internal server error';
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

export {
  DBQueryError,
  DBWriteError,
  DBMalformedDataError,
  DBNonExistentEntryError,
  RequestMissingDataError,
  RequestInvalidDataError,
  InternalServerError,
};
