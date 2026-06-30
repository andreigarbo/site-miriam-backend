import path from 'path';
import Database from 'better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import { dbServiceOperationStatusCode } from '../constants/dbStatusCodes.js';
import {
  DBMalformedDataError,
  RequestMissingDataError,
  DBNonExistentEntryError,
} from '../errors/errors.js';

class dbConnectionService {
  static #instance: dbConnectionService;
  connection: BetterSqlite3.Database;

  private createAnalyticsTable() {
    this.connection.exec(
      `CREATE TABLE IF NOT EXISTS analytics(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      continent_code TEXT NOT NULL,
      country_name TEXT NOT NULL,
      city_name TEXT NOT NULL,
      visits INTEGER
      )`,
    );
  }

  private createUsersTable() {
    this.connection.exec(
      `CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      secret TEXT NOT NULL
      )`,
    );
  }

  constructor() {
    if (!dbConnectionService.#instance) {
      dbConnectionService.#instance = this;
    }
    this.connection = new Database(path.resolve('./dist/data/portfolio.db'));
    this.connection.pragma('journal_mode = WAL');
    this.createAnalyticsTable();
    this.createUsersTable();
    return dbConnectionService.#instance;
  }

  public query(
    sql: string,
    params: string[],
    operation: 'get' | 'insert' | 'update' | 'selectAll' | 'delete',
  ): Object[] | Object | null {
    const preparedStatement = this.connection.prepare(sql);
    try {
      let executionResult = null;
      switch (operation) {
        case 'update':
        case 'insert':
        case 'delete':
          executionResult = preparedStatement.run(params);
          return null;
        case 'get':
          executionResult = preparedStatement.get(params);

          if (executionResult == undefined) {
            throw new DBNonExistentEntryError();
            // return [dbServiceOperationStatusCode.no_data, null];
          }
          return executionResult;
        case 'selectAll':
          executionResult = preparedStatement.all(params);
          if (executionResult == undefined) {
            throw new DBNonExistentEntryError();

            // return [dbServiceOperationStatusCode.no_data, null];
          }
          return executionResult;
      }
    } catch (error) {
      throw error;
      // return [dbServiceOperationStatusCode.error, null];
    }
  }
}

export { dbConnectionService };
