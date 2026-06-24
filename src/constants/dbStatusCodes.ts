enum dbServiceOperationStatusCode {
  success = 'SUCCESS',
  error = 'ERROR',
  no_data = 'NO_DATA',
}

enum dbAnalyticsRepoOperationStatusCode {
  no_city = 'NO_CITY_NAME_PROVIDED',
  no_country = 'NO_COUNTRY_NAME_PROVIDED',
  no_continent = 'NO_CONTINENT_NAME_PROVIDED',
  no_visits = 'NO_VISITS_PROVIDED',
  error_querying_db = 'ERROR_QUERYING_DB',
  error_writing_db = 'ERROR_WRITING_DB',
  malformed_db_data = 'MALFORMED_DB_DATA',
  non_existent_entry = 'NON_EXISTENT_ENTRY',
  success = 'SUCCESS',
}

export { dbServiceOperationStatusCode, dbAnalyticsRepoOperationStatusCode };
