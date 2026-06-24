import { dbConnectionService } from '../services/db.js';
import type { AnalyticsDataEntry, AnalyticsData } from '../models/analytics.js';
import {
  dbAnalyticsRepoOperationStatusCode,
  dbServiceOperationStatusCode,
} from '../constants/dbStatusCodes.js';

import { isAnalyticsDataEntry } from '../middlewares/typeGuards.js';
import { addAbortListener } from 'node:events';

export class analyticsRepo {
  static #instance: analyticsRepo;

  constructor() {
    if (!analyticsRepo.#instance) {
      analyticsRepo.#instance = this;
    }

    return analyticsRepo.#instance;
  }

  private toCamelCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
  }

  private dbObjToAnalyticsEntry(
    objectToTransform: Object,
  ): AnalyticsDataEntry | null {
    // interface tempInt {
    //   continentCode: any;
    //   countryName: any;
    //   cityName: any;
    //   id: any;
    //   visits: any;
    // }

    interface tempInt {
      [key: string]: any;
    }

    const transformObj = {} as tempInt;
    for (const field in objectToTransform) {
      if (field == 'continent_code' && field in objectToTransform) {
        transformObj['continentCode'] = objectToTransform[field];
      }

      if (field == 'country_name' && field in objectToTransform) {
        transformObj['countryName'] = objectToTransform[field];
      }

      if (field == 'city_name' && field in objectToTransform) {
        transformObj['cityName'] = objectToTransform[field];
      }

      if (field == 'id' && field in objectToTransform) {
        transformObj['id'] = objectToTransform[field];
      }

      if (field == 'visits' && field in objectToTransform) {
        transformObj['visits'] = objectToTransform['visits'];
      }
    }
    if (isAnalyticsDataEntry(transformObj)) return transformObj;
    return null;
  }

  public insert(data: AnalyticsDataEntry): dbAnalyticsRepoOperationStatusCode {
    const dbConnection = new dbConnectionService();

    const insertVisitorCountEntryStatement =
      'INSERT into analytics (continent_code, country_name, city_name, visits) VALUES (?, ?, ?, 1)';

    if (!data.continentCode || data.continentCode == '') {
      return dbAnalyticsRepoOperationStatusCode.no_continent;
    }

    if (!data.countryName || data.countryName == '') {
      return dbAnalyticsRepoOperationStatusCode.no_country;
    }

    if (!data.cityName || data.cityName == '') {
      return dbAnalyticsRepoOperationStatusCode.no_city;
    }

    const requestParams = [data.continentCode, data.countryName, data.cityName];

    const [insertQueryStatusCode, insertQueryResult] = dbConnection.query(
      insertVisitorCountEntryStatement,
      requestParams,
      'insert',
    );

    if (insertQueryStatusCode == dbServiceOperationStatusCode.error) {
      return dbAnalyticsRepoOperationStatusCode.error_writing_db;
    }

    return dbAnalyticsRepoOperationStatusCode.success;
  }

  public update(data: AnalyticsDataEntry): dbAnalyticsRepoOperationStatusCode {
    const dbConnection = new dbConnectionService();

    const updateVisitorCountStatement =
      'UPDATE analytics set visits = ? WHERE continent_code = ? AND country_name = ? AND city_name = ?';

    if (!data.continentCode || data.continentCode == '') {
      return dbAnalyticsRepoOperationStatusCode.no_continent;
    }

    if (!data.countryName || data.countryName == '') {
      return dbAnalyticsRepoOperationStatusCode.no_country;
    }

    if (!data.cityName || data.cityName == '') {
      return dbAnalyticsRepoOperationStatusCode.no_city;
    }

    if (!data.visits) {
      return dbAnalyticsRepoOperationStatusCode.no_visits;
    }
    const requestParams = [
      data.visits.toString(),
      data.continentCode,
      data.countryName,
      data.cityName,
    ];

    const [updateQueryStatusCode, updateQueryResult] = dbConnection.query(
      updateVisitorCountStatement,
      requestParams,
      'update',
    );

    if (updateQueryStatusCode == dbServiceOperationStatusCode.no_data) {
      return dbAnalyticsRepoOperationStatusCode.non_existent_entry;
    }

    if (updateQueryStatusCode == dbServiceOperationStatusCode.error) {
      return dbAnalyticsRepoOperationStatusCode.error_writing_db;
    }

    return dbAnalyticsRepoOperationStatusCode.success;
  }

  public delete(data: AnalyticsDataEntry): dbAnalyticsRepoOperationStatusCode {
    const dbConnection = new dbConnectionService();

    const deleteEntryStatement =
      'DELETE FROM analytics WHERE continent_code = ? AND country_name = ? AND city_name = ?';

    if (!data.continentCode || data.continentCode == '') {
      return dbAnalyticsRepoOperationStatusCode.no_continent;
    }

    if (!data.countryName || data.countryName == '') {
      return dbAnalyticsRepoOperationStatusCode.no_country;
    }

    if (!data.cityName || data.cityName == '') {
      return dbAnalyticsRepoOperationStatusCode.no_city;
    }
    const requestParams = [data.continentCode, data.countryName, data.cityName];

    const [deleteQueryStatusCode, deleteQueryResult] = dbConnection.query(
      deleteEntryStatement,
      requestParams,
      'delete',
    );

    if (deleteQueryStatusCode == dbServiceOperationStatusCode.no_data) {
      return dbAnalyticsRepoOperationStatusCode.non_existent_entry;
    }

    if (deleteQueryStatusCode == dbServiceOperationStatusCode.error) {
      return dbAnalyticsRepoOperationStatusCode.error_writing_db;
    }

    return dbAnalyticsRepoOperationStatusCode.success;
  }

  public get(
    data: AnalyticsDataEntry,
  ): [dbAnalyticsRepoOperationStatusCode, AnalyticsDataEntry | null] {
    const dbConnection = new dbConnectionService();

    const selectAllStatement =
      'SELECT * FROM analytics WHERE continent_code = ? AND country_name = ? AND city_name = ?';

    if (!data.continentCode || data.continentCode == '') {
      return [dbAnalyticsRepoOperationStatusCode.no_continent, null];
    }

    if (!data.countryName || data.countryName == '') {
      return [dbAnalyticsRepoOperationStatusCode.no_country, null];
    }

    if (!data.cityName || data.cityName == '') {
      return [dbAnalyticsRepoOperationStatusCode.no_city, null];
    }

    const requestParams = [data.continentCode, data.countryName, data.cityName];

    const [selectQueryStatusCode, selectQueryResult] = dbConnection.query(
      selectAllStatement,
      requestParams,
      'get',
    );

    if (
      selectQueryStatusCode == dbServiceOperationStatusCode.no_data &&
      selectQueryResult == undefined
    ) {
      return [dbAnalyticsRepoOperationStatusCode.non_existent_entry, null];
    }

    if (
      selectQueryStatusCode == dbServiceOperationStatusCode.error ||
      !selectQueryResult ||
      selectQueryResult == null
    ) {
      return [dbAnalyticsRepoOperationStatusCode.error_querying_db, null];
    }

    const response = this.dbObjToAnalyticsEntry(selectQueryResult);

    if (response == null) {
      return [dbAnalyticsRepoOperationStatusCode.malformed_db_data, null];
    }
    return [dbAnalyticsRepoOperationStatusCode.success, response];
  }

  public getAll(): [dbAnalyticsRepoOperationStatusCode, AnalyticsData | null] {
    const dbConnection = new dbConnectionService();

    const selectAllStatement = 'SELECT * FROM analytics';

    const result = {} as AnalyticsData;
    result.data = [];
    result.count = 0;

    const [selectQueryStatusCode, selectQueryResult] = dbConnection.query(
      selectAllStatement,
      [],
      'selectAll',
    );

    if (
      selectQueryStatusCode == dbServiceOperationStatusCode.error ||
      !selectQueryResult ||
      selectQueryResult == null
    ) {
      return [dbAnalyticsRepoOperationStatusCode.error_querying_db, null];
    }

    if (!Array.isArray(selectQueryResult)) {
      return [dbAnalyticsRepoOperationStatusCode.malformed_db_data, null];
    }

    for (const analyticsEntry of selectQueryResult) {
      const transformObj = {} as AnalyticsDataEntry;

      for (const field in analyticsEntry) {
        if (field == 'continent_code') {
          transformObj['continentCode'] = analyticsEntry[field];
        }

        if (field == 'country_name') {
          transformObj['countryName'] = analyticsEntry[field];
        }

        if (field == 'city_name') {
          transformObj['cityName'] = analyticsEntry[field];
        }

        if (field == 'id') {
          transformObj['id'] = analyticsEntry[field];
        }

        if (field == 'visits') {
          transformObj['visits'] = analyticsEntry['visits'];
        }
      }
      if (isAnalyticsDataEntry(transformObj)) {
        result.data.push(analyticsEntry);
        result.count++;
      }
    }

    return [dbAnalyticsRepoOperationStatusCode.success, result];
  }
}
