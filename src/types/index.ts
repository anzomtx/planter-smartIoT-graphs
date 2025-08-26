export interface ApiDataPoint {
  id: string;
  topicId: string;
  msgId: string;
  tenantId: string;
  productId: string;
  productName: string;
  deviceId: string;
  deviceName: string;
  updateTime: string;
  value: string;
}

export interface ParsedValue {
  temperature?: number;
  humidity?: number;
_co2?: number;
  co2?: number;
  tvoc?: number;
}

export interface ChartDataPoint {
  time: string;
  value: number;
}

export interface EndpointConfig {
  id: string;
  name: string;
  url: string;
  dataKey: keyof ParsedValue;
  yAxisLabel: string;
}

export interface GraphCustomization {
  color: string;
  yMin?: number | string;
  yMax?: number | string;
}
