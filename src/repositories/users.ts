import {
  dbServiceOperationStatusCode,
  dbUserRepoOperationStatusCode,
} from '../constants/dbStatusCodes.js';
import {
  DBMalformedDataError,
  RequestMissingDataError,
} from '../errors/errors.js';
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

  public insert(data: User) {
    const dbConnection = new dbConnectionService();

    const insertUserStatement =
      'INSERT into users (username, password, role, secret) VALUES (?, ?, ?, ?)';

    if (!data.username || data.username == '') {
      throw new RequestMissingDataError('username');
      // return dbUserRepoOperationStatusCode.no_username;
    }

    if (!data.password || data.password == '') {
      throw new RequestMissingDataError('password');
      // return dbUserRepoOperationStatusCode.no_password;
    }

    if (!data.role || data.role == '') {
      throw new RequestMissingDataError('role');
      // return dbUserRepoOperationStatusCode.no_role;
    }

    if (!data.secret || data.secret == '') {
      throw new RequestMissingDataError('secret');
      // return dbUserRepoOperationStatusCode.no_secret;
    }

    const requestParams = [
      data.username,
      data.password,
      data.role,
      data.secret,
    ];

    let insertQueryResult = null;

    try {
      insertQueryResult = dbConnection.query(
        insertUserStatement,
        requestParams,
        'insert',
      );
    } catch (error) {
      throw error;
    }
  }

  public update(username: string, data: User) {
    const dbConnection = new dbConnectionService();

    const updateUsersArray = ['UPDATE users SET ', '', ' WHERE username = ?'];

    const updateUsernameInsert = 'username = ?';
    const updatePasswordInsert = 'password = ?';
    const updateRoleInsert = 'role = ?';

    let updateStatement = '';
    let updateParams = [];

    if (!username || username == '') {
      throw new RequestMissingDataError('username');
      // return dbUserRepoOperationStatusCode.no_username;
    }

    if (data.username == '' && data.password == '' && data.role == '') {
      throw new RequestMissingDataError('either username, password or role');
      // return dbUserRepoOperationStatusCode.no_data_for_update;
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

    try {
      dbConnection.query(updateStatement, updateParams, 'update');
    } catch (error) {
      throw error;
    }
  }

  public delete(username: string) {
    const dbConnection = new dbConnectionService();

    const deleteEntryStatement = 'DELETE FROM users WHERE username = ?';

    if (!username || username == '') {
      throw new RequestMissingDataError('username');
    }

    const requestParams = [username];

    try {
      dbConnection.query(deleteEntryStatement, requestParams, 'delete');
    } catch (error) {
      throw error;
    }
  }

  public get(username: string): User | null {
    const dbConnection = new dbConnectionService();

    const selectUserStatement = 'SELECT * FROM users WHERE username = ?';

    if (username || username == '') {
      throw new RequestMissingDataError('username');
    }

    const requestParams = [username];

    try {
      const selectQueryResult = dbConnection.query(
        selectUserStatement,
        requestParams,
        'get',
      );
      if (!isUser(selectQueryResult)) {
        throw new DBMalformedDataError();
      }
      return selectQueryResult;
    } catch (error) {
      throw error;
    }
  }
}
