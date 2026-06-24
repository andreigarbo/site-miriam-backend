import path from 'path';
import Database from 'better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';
import { dbServiceOperationStatusCode } from '../constants/dbStatusCodes.js';

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

  constructor() {
    if (!dbConnectionService.#instance) {
      dbConnectionService.#instance = this;
    }
    this.connection = new Database(path.resolve('./dist/data/portfolio.db'));
    this.connection.pragma('journal_mode = WAL');
    this.createAnalyticsTable();
    return dbConnectionService.#instance;
  }

  // public static get instance() {
  //   if (!dbConnectionService.#instance) {
  //     dbConnectionService.#instance = new dbConnectionService();
  //   }
  //   return dbConnectionService.#instance;
  // }

  public query(
    sql: string,
    params: string[],
    operation: 'get' | 'insert' | 'update' | 'selectAll' | 'delete',
  ): [dbServiceOperationStatusCode, Object[] | Object | null] {
    const preparedStatement = this.connection.prepare(sql);
    try {
      let executionResult = null;
      switch (operation) {
        case 'update':
        case 'insert':
        case 'delete':
          executionResult = preparedStatement.run(params);
          return [dbServiceOperationStatusCode.success, null];
        case 'get':
          executionResult = preparedStatement.get(params);

          if (executionResult == undefined) {
            return [dbServiceOperationStatusCode.no_data, null];
          }
          return [dbServiceOperationStatusCode.success, executionResult];
        case 'selectAll':
          executionResult = preparedStatement.all(params);
          if (executionResult == undefined) {
            return [dbServiceOperationStatusCode.no_data, null];
          }
          return [dbServiceOperationStatusCode.success, executionResult];
      }
    } catch (error) {
      console.log(error);
      return [dbServiceOperationStatusCode.error, null];
    }
  }
}

export { dbConnectionService };
