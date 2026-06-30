import type { Request, Response, NextFunction } from 'express';
import { analyticsRepo } from '../repositories/analytics.js';
import { dbAnalyticsRepoOperationStatusCode } from '../constants/dbStatusCodes.js';
import type { AnalyticsDataEntry } from '../models/analytics.js';
import { errorHandler } from '../errors/handler.js';
import {
  DBMalformedDataError,
  RequestMissingDataError,
  DBNonExistentEntryError,
} from '../errors/errors.js';

export class analyticsDataController {
  static #instance: analyticsDataController;

  constructor() {
    if (!analyticsDataController.#instance) {
      analyticsDataController.#instance = this;
    }

    return analyticsDataController.#instance;
  }

  public reportAnalytics(req: Request, res: Response, next: NextFunction) {
    const analyticsRepoInstance = new analyticsRepo();

    const { continentCode, countryName, cityName } = req.body;

    if (!continentCode || continentCode == '') {
      throw new RequestMissingDataError('continentCode');
    }

    if (!countryName || countryName == '') {
      throw new RequestMissingDataError('countryName');
    }

    if (!cityName || cityName == '') {
      throw new RequestMissingDataError('cityName');
    }

    const requestData = {
      continentCode: continentCode,
      countryName: countryName,
      cityName: cityName,
    } as AnalyticsDataEntry;

    let currentAnalyticsResult = null;
    try {
      currentAnalyticsResult = analyticsRepoInstance.get(requestData);
    } catch (error: any) {
      if (error instanceof DBNonExistentEntryError) {
        requestData['visits'] = 1;
        try {
          analyticsRepoInstance.insert(requestData);
          return;
        } catch (error: any) {
          throw error;
        }
      } else {
        throw error;
      }
    }

    //analytics exist, increase visits by 1
    if (!currentAnalyticsResult || !('visits' in currentAnalyticsResult)) {
      throw new DBMalformedDataError();
    }

    currentAnalyticsResult.visits++;

    try {
      analyticsRepoInstance.update(currentAnalyticsResult);
    } catch (error: any) {
      throw error;
    }
  }

  public getAll(req: Request, res: Response, next: NextFunction) {
    const analyticsRepoInstance = new analyticsRepo();

    let getAllResponse = null;
    try {
      getAllResponse = analyticsRepoInstance.getAll();
    } catch (error) {
      throw error;
    }

    res.status(200).json(getAllResponse);
  }

  public getByAllParams(req: Request, res: Response, next: NextFunction) {
    const analyticsRepoInstance = new analyticsRepo();

    const { continentCode, countryName, cityName } = req.body;

    if (!continentCode || continentCode == '') {
      throw new RequestMissingDataError('continentCode');
    }

    if (!countryName || countryName == '') {
      throw new RequestMissingDataError('countryName');
    }

    if (!cityName || cityName == '') {
      throw new RequestMissingDataError('cityName');
    }

    const requestData = {
      continentCode: continentCode,
      countryName: countryName,
      cityName: cityName,
    } as AnalyticsDataEntry;

    let getResponse = null;
    try {
      getResponse = analyticsRepoInstance.get(requestData);
    } catch (error) {
      throw error;
    }

    res.status(200).json(getResponse);
    return;
  }

  public query(req: Request, res: Response, next: NextFunction) {
    const analyticsRepoInstance = new analyticsRepo();

    const { continentCode, countryName, cityName } = req.body;
  }
}
