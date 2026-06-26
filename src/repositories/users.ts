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
      'INSERT into users (username, password, role, secret) VALUES (?, ?, ?, ?)';

    if (!data.username || data.username == '') {
      return dbUserRepoOperationStatusCode.no_username;
    }

    if (!data.password || data.password == '') {
      return dbUserRepoOperationStatusCode.no_password;
    }

    if (!data.role || data.role == '') {
      return dbUserRepoOperationStatusCode.no_role;
    }

    if (!data.secret || data.secret == '') {
      return dbUserRepoOperationStatusCode.no_secret;
    }

    const requestParams = [
      data.username,
      data.password,
      data.role,
      data.secret,
    ];

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

    const updateUsersArray = ['UPDATE users SET ', '', ' WHERE username = ?'];

    const updateUsernameInsert = 'username = ?';
    const updatePasswordInsert = 'password = ?';
    const updateRoleInsert = 'role = ?';

    let updateStatement = '';
    let updateParams = [];

    if (!username || username == '') {
      return dbUserRepoOperationStatusCode.no_username;
    }

    if (data.username == '' && data.password == '' && data.role == '') {
      return dbUserRepoOperationStatusCode.no_data_for_update;
    }

    let preparedString = '';
    let preparedStringArray = [];
    let paramNo = 0;

    if (data.username && data.username != '') {
      preparedStringArray[paramNo] = updateUsernameInsert;
      updateParams[paramNo] = data.username;
      paramNo++;
    }

    if (data.password && data.password != '') {
      preparedStringArray[paramNo] = updatePasswordInsert;
      updateParams[paramNo] = data.password;
      paramNo++;
    }

    if (data.role && data.role != '') {
      preparedStringArray[paramNo] = updateRoleInsert;
      updateParams[paramNo] = data.role;
      paramNo++;
    }

    updateParams[paramNo] = username;

    for (let i = 0; i < paramNo; i++) {
      preparedString += preparedStringArray[i];
      if (i != paramNo - 1) {
        preparedString += ', ';
      }
    }

    updateUsersArray[1] = preparedString;

    updateStatement = updateUsersArray.join('');

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

  public delete(username: string): dbUserRepoOperationStatusCode {
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

  public get(username: string): [dbUserRepoOperationStatusCode, User | null] {
    const dbConnection = new dbConnectionService();

    const selectUserStatement = 'SELECT * FROM users WHERE username = ?';

    if (username || username == '') {
      return [dbUserRepoOperationStatusCode.no_username, null];
    }

    const requestParams = [username];

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
