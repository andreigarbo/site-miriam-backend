import {
  dbServiceOperationStatusCode,
  dbUserRepoOperationStatusCode,
} from '../constants/dbStatusCodes.js';
import { isUser } from '../middlewares/typeGuards.js';
import type { User } from '../models/user.js';
import { dbConnectionService } from '../services/db.js';

export class usersRepo {
  static #instance: usersRepo;

  constructor() {
    if (!usersRepo.#instance) {
      usersRepo.#instance = this;
    }

    return usersRepo.#instance;
  }

  public insert(data: User): dbUserRepoOperationStatusCode {
    const dbConnection = new dbConnectionService();

    const insertUserStatement =
      'INSERT into users (username, password) VALUES (?, ?)';

    if (!data.username || data.username == '') {
      return dbUserRepoOperationStatusCode.no_username;
    }

    if (!data.password || data.password == '') {
      return dbUserRepoOperationStatusCode.no_password;
    }

    const requestParams = [data.username, data.password];

    const [insertQueryStatusCode, insertQueryResult] = dbConnection.query(
      insertUserStatement,
      requestParams,
      'insert',
    );

    if (insertQueryStatusCode == dbServiceOperationStatusCode.error) {
      return dbUserRepoOperationStatusCode.error_writing_db;
    }

    return dbUserRepoOperationStatusCode.success;
  }

  public update(username: string, data: User): dbUserRepoOperationStatusCode {
    const dbConnection = new dbConnectionService();
    let noUsername = false;
    let noPassword = false;

    const updateUsernameStatement =
      'UPDATE users SET username = ? WHERE username = ?';
    const updatePasswordStatement =
      'UPDATE users SET password = ? WHERE username = ?';
    const updateUsernamePasswordStatement =
      'UPDATE users SET username = ?, password = ? WHERE username = ?';

    let updateStatement = '';
    let updateParams = [];

    if (!username || username == '') {
      return dbUserRepoOperationStatusCode.no_username;
    }

    if (data.username == '' && data.password == '') {
      return dbUserRepoOperationStatusCode.no_data_for_update;
    }

    if (data.username == '') {
      noUsername = true;
    }

    if (data.password == '') {
      noPassword = true;
    }

    if (noUsername) {
      updateStatement = updatePasswordStatement;
      updateParams = [username, data.password];
    } else if (noPassword) {
      updateStatement = updateUsernameStatement;
      updateParams = [username, data.username];
    } else {
      updateStatement = updateUsernamePasswordStatement;
      updateParams = [username, data.password, data.username];
    }

    const [updateQueryStatusCode, updateQueryResult] = dbConnection.query(
      updateStatement,
      updateParams,
      'update',
    );

    if (updateQueryStatusCode == dbServiceOperationStatusCode.no_data) {
      return dbUserRepoOperationStatusCode.non_existent_entry;
    }

    if (updateQueryStatusCode == dbServiceOperationStatusCode.error) {
      return dbUserRepoOperationStatusCode.error_writing_db;
    }

    return dbUserRepoOperationStatusCode.success;
  }

  public delete(username: string) {
    const dbConnection = new dbConnectionService();

    const deleteEntryStatement = 'DELETE FROM users WHERE username = ?';

    if (!username || username == '') {
      return dbUserRepoOperationStatusCode.no_username;
    }

    const requestParams = [username];

    const [deleteQueryStatusCode, deleteQueryResult] = dbConnection.query(
      deleteEntryStatement,
      requestParams,
      'delete',
    );

    if (deleteQueryStatusCode == dbServiceOperationStatusCode.no_data) {
      return dbUserRepoOperationStatusCode.non_existent_entry;
    }

    if (deleteQueryStatusCode == dbServiceOperationStatusCode.error) {
      return dbUserRepoOperationStatusCode.error_writing_db;
    }

    return dbUserRepoOperationStatusCode.success;
  }

  public get(data: User): [dbUserRepoOperationStatusCode, User | null] {
    const dbConnection = new dbConnectionService();

    const selectUserStatement =
      'SELECT * FROM users WHERE username = ? AND password = ?';

    if (!data.username || data.username == '') {
      return [dbUserRepoOperationStatusCode.no_username, null];
    }

    if (!data.password || data.password == '') {
      return [dbUserRepoOperationStatusCode.no_password, null];
    }

    const requestParams = [data.username, data.password];

    const [selectQueryStatusCode, selectQueryResult] = dbConnection.query(
      selectUserStatement,
      requestParams,
      'get',
    );

    if (
      selectQueryStatusCode == dbServiceOperationStatusCode.error ||
      !selectQueryResult ||
      selectQueryResult == null
    ) {
      return [dbUserRepoOperationStatusCode.error_querying_db, null];
    }

    if (!isUser(selectQueryResult)) {
      return [dbUserRepoOperationStatusCode.malformed_db_data, null];
    }

    return [dbUserRepoOperationStatusCode.success, selectQueryResult];
  }
}
