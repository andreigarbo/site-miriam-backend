export interface AnalyticsDataEntry {
  id?: number;
  continentCode: string;
  countryName: string;
  cityName: string;
  visits?: number;
}

export interface AnalyticsData {
  data: AnalyticsDataEntry[];
  count: number;
}
