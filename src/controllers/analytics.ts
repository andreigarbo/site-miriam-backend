import type { Request, Response, NextFunction } from 'express';
import { analyticsRepo } from '../repositories/analytics.js';
import { dbAnalyticsRepoOperationStatusCode } from '../constants/dbStatusCodes.js';
import type { AnalyticsDataEntry } from '../models/analytics.js';
import { create } from 'node:domain';

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
      res.status(400).json({
        message: 'no continent code provided',
      });
      return;
    }

    if (!countryName || countryName == '') {
      res.status(400).json({
        message: 'no country provided',
      });
      return;
    }

    if (!cityName || cityName == '') {
      res.status(400).json({
        message: 'no city provided',
      });
      return;
    }
    const requestData = {
      continentCode: continentCode,
      countryName: countryName,
      cityName: cityName,
    } as AnalyticsDataEntry;

    const [currentAnalyticsStatuscode, currentAnalyticsResult] =
      analyticsRepoInstance.get(requestData);

    if (
      currentAnalyticsStatuscode ==
      dbAnalyticsRepoOperationStatusCode.non_existent_entry
    ) {
      //no analytics for this location, create entry with visits = 1
      requestData['visits'] = 1;
      const createEntryAnalyticsStatusCode =
        analyticsRepoInstance.insert(requestData);

      if (
        createEntryAnalyticsStatusCode !=
        dbAnalyticsRepoOperationStatusCode.success
      ) {
        res.status(500).json({
          message: 'internal server error',
        });
        return;
      }
    } else if (
      currentAnalyticsStatuscode == dbAnalyticsRepoOperationStatusCode.success
    ) {
      //analytics exist, increase visits by 1
      if (!currentAnalyticsResult || !('visits' in currentAnalyticsResult)) {
        res.status(500).json({
          message: 'internal server error',
        });
        return;
      }

      currentAnalyticsResult.visits++;

      const updateEntryAnalyticsStatusCode = analyticsRepoInstance.update(
        currentAnalyticsResult,
      );

      if (
        updateEntryAnalyticsStatusCode !=
        dbAnalyticsRepoOperationStatusCode.success
      ) {
        res.status(500).json({
          message: 'error reporting visit',
        });
        return;
      }
    }
    res.status(200).json({
      message: 'success',
    });
    return;
  }

  public getAll(req: Request, res: Response, next: NextFunction) {
    const analyticsRepoInstance = new analyticsRepo();

    const [getAllResponseStatusCode, getAllResponse] =
      analyticsRepoInstance.getAll();

    if (
      getAllResponseStatusCode ==
      dbAnalyticsRepoOperationStatusCode.error_querying_db
    ) {
      res.status(500).json({
        message: 'Error while querying DB',
      });
      return;
      //   throw new DBQueryError('Error while querying DB');
    }
    res.status(200).json(getAllResponse);
    return;
  }

  public getByAllParams(req: Request, res: Response, next: NextFunction) {
    const analyticsRepoInstance = new analyticsRepo();

    const { continentCode, countryName, cityName } = req.body;

    if (!continentCode || continentCode == '') {
      res.status(400).json({
        message: 'no continent code provided',
      });
      return;
    }

    if (!countryName || countryName == '') {
      res.status(400).json({
        message: 'no country provided',
      });
      return;
    }

    if (!cityName || cityName == '') {
      res.status(400).json({
        message: 'no city provided',
      });
      return;
    }

    const requestData = {
      continentCode: continentCode,
      countryName: countryName,
      cityName: cityName,
    } as AnalyticsDataEntry;

    const [getResponseStatusCode, getResponse] =
      analyticsRepoInstance.get(requestData);

    if (
      getResponseStatusCode ==
      dbAnalyticsRepoOperationStatusCode.non_existent_entry
    ) {
      res.status(404).json({
        message: 'no data for specified params',
      });
      return;
    }

    if (getResponseStatusCode != dbAnalyticsRepoOperationStatusCode.success) {
      res.status(500).json({
        message: 'internal server error',
      });
      return;
    }

    res.status(200).json(getResponse);
    return;
  }

  public query(req: Request, res: Response, next: NextFunction) {
    const analyticsRepoInstance = new analyticsRepo();

    const { continentCode, countryName, cityName } = req.body;
  }
}
