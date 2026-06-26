import type { AnalyticsDataEntry } from '../models/analytics.js';
import type { User } from '../models/user.js';

function isAnalyticsDataEntry(obj: Object): obj is AnalyticsDataEntry {
  if (obj == undefined) {
    return false;
  }

  if (!('continentCode' in obj)) {
    return false;
  }

  if (!('countryName' in obj)) {
    return false;
  }

  if (!('cityName' in obj)) {
    return false;
  }

  if (!('visits' in obj)) {
    return false;
  }
  return true;
}

function isUser(obj: Object): obj is User {
  if (obj == undefined) {
    return false;
  }

  if (!('username' in obj)) {
    return false;
  }

  if (!('password' in obj)) {
    return false;
  }

  return true;
}
export { isAnalyticsDataEntry, isUser };
