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
  data1?: number | string;
  data2?: number | string;
  data3?: number | string;
  data4?: number | string;
}

export interface ChartDataPoint {
  time: string;
  value: number;
}

export interface EndpointConfig {
  id: string;
  name: string;
  url: string;
  dataKey: "data1" | "data2" | "data3" | "data4";
  yAxisLabel: string;
}

export interface GraphCustomization {
  color: string;
  yMin?: number | string;
  yMax?: number | string;
}
