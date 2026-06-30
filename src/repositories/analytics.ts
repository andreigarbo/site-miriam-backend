import { dbConnectionService } from '../services/db.js';
import type { AnalyticsDataEntry, AnalyticsData } from '../models/analytics.js';
import {
  dbAnalyticsRepoOperationStatusCode,
  dbServiceOperationStatusCode,
} from '../constants/dbStatusCodes.js';

import { isAnalyticsDataEntry } from '../middlewares/typeGuards.js';
import {
  DBMalformedDataError,
  RequestMissingDataError,
} from '../errors/errors.js';

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

  public insert(data: AnalyticsDataEntry) {
    const dbConnection = new dbConnectionService();

    const insertVisitorCountEntryStatement =
      'INSERT into analytics (continent_code, country_name, city_name, visits) VALUES (?, ?, ?, 1)';

    if (!data.continentCode || data.continentCode == '') {
      throw new RequestMissingDataError('continentCode');
    }

    if (!data.countryName || data.countryName == '') {
      throw new RequestMissingDataError('countryName');
    }

    if (!data.cityName || data.cityName == '') {
      throw new RequestMissingDataError('cityName');
    }

    const requestParams = [data.continentCode, data.countryName, data.cityName];

    try {
      dbConnection.query(
        insertVisitorCountEntryStatement,
        requestParams,
        'insert',
      );
    } catch (error) {
      throw error;
    }
  }

  public update(data: AnalyticsDataEntry) {
    const dbConnection = new dbConnectionService();

    const updateVisitorCountStatement =
      'UPDATE analytics set visits = ? WHERE continent_code = ? AND country_name = ? AND city_name = ?';

    if (!data.continentCode || data.continentCode == '') {
      throw new RequestMissingDataError('continentCode');
      // return dbAnalyticsRepoOperationStatusCode.no_continent;
    }

    if (!data.countryName || data.countryName == '') {
      throw new RequestMissingDataError('countryName');
      // return dbAnalyticsRepoOperationStatusCode.no_country;
    }

    if (!data.cityName || data.cityName == '') {
      throw new RequestMissingDataError('cityName');
      // return dbAnalyticsRepoOperationStatusCode.no_city;
    }

    if (!data.visits) {
      throw new DBMalformedDataError();
      // return dbAnalyticsRepoOperationStatusCode.no_visits;
    }
    const requestParams = [
      data.visits.toString(),
      data.continentCode,
      data.countryName,
      data.cityName,
    ];

    try {
      dbConnection.query(updateVisitorCountStatement, requestParams, 'update');
    } catch (error) {
      throw error;
    }
  }

  public delete(data: AnalyticsDataEntry) {
    const dbConnection = new dbConnectionService();

    const deleteEntryStatement =
      'DELETE FROM analytics WHERE continent_code = ? AND country_name = ? AND city_name = ?';

    if (!data.continentCode || data.continentCode == '') {
      throw new RequestMissingDataError('continentCode');
      // return dbAnalyticsRepoOperationStatusCode.no_continent;
    }

    if (!data.countryName || data.countryName == '') {
      throw new RequestMissingDataError('countryName');
      // return dbAnalyticsRepoOperationStatusCode.no_country;
    }

    if (!data.cityName || data.cityName == '') {
      throw new RequestMissingDataError('cityName');
      // return dbAnalyticsRepoOperationStatusCode.no_city;
    }
    const requestParams = [data.continentCode, data.countryName, data.cityName];

    try {
      dbConnection.query(deleteEntryStatement, requestParams, 'delete');
    } catch (error) {
      throw error;
    }
  }

  public get(data: AnalyticsDataEntry): AnalyticsDataEntry | null {
    const dbConnection = new dbConnectionService();

    const selectAllStatement =
      'SELECT * FROM analytics WHERE continent_code = ? AND country_name = ? AND city_name = ?';

    if (!data.continentCode || data.continentCode == '') {
      throw new RequestMissingDataError('continentCode');
      // return [dbAnalyticsRepoOperationStatusCode.no_continent, null];
    }

    if (!data.countryName || data.countryName == '') {
      throw new RequestMissingDataError('countryName');
      // return [dbAnalyticsRepoOperationStatusCode.no_country, null];
    }

    if (!data.cityName || data.cityName == '') {
      throw new RequestMissingDataError('cityName');
      // return [dbAnalyticsRepoOperationStatusCode.no_city, null];
    }

    const requestParams = [data.continentCode, data.countryName, data.cityName];
    let selectQueryResult = null;
    try {
      selectQueryResult = dbConnection.query(
        selectAllStatement,
        requestParams,
        'get',
      );
    } catch (error) {
      throw error;
    }

    if (selectQueryResult == null) {
      return null;
    }

    const response = this.dbObjToAnalyticsEntry(selectQueryResult);

    if (response == null) {
      return null;
    }
    return response;
  }

  public getAll(): AnalyticsData | null {
    const dbConnection = new dbConnectionService();

    const selectAllStatement = 'SELECT * FROM analytics';

    const result = {} as AnalyticsData;
    result.data = [];
    result.count = 0;

    let selectQueryResult = null;

    try {
      selectQueryResult = dbConnection.query(
        selectAllStatement,
        [],
        'selectAll',
      );
    } catch (error) {
      throw error;
    }

    if (!Array.isArray(selectQueryResult)) {
      throw new DBMalformedDataError();
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

    return result;
  }
}
