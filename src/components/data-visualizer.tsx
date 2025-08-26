"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraphCard } from "@/components/graph-card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { EndpointConfig, GraphCustomization } from "@/types";

const singleEndpointUrl = "https://smartiot.space/api/iot/iotTopicData/deviceUpdateDataList?topicId=1960179631955456001";

const endpoints: EndpointConfig[] = [
  {
    id: "brightness",
    name: "Brightness",
    url: singleEndpointUrl,
    dataKey: "data1",
    yAxisLabel: "Brightness (lux)",
  },
  {
    id: "humidity",
    name: "Humidity",
    url: singleEndpointUrl,
    dataKey: "data2",
    yAxisLabel: "Humidity (%)",
  },
  {
    id: "soil-moisture",
    name: "Soil Moisture",
    url: singleEndpointUrl,
    dataKey: "data3",
    yAxisLabel: "Moisture",
  },
  {
    id: "temperature",
    name: "Temperature",
    url: singleEndpointUrl,
    dataKey: "data4",
    yAxisLabel: "Temp (°C)",
  },
];

const defaultCustomizations: { [key: string]: GraphCustomization } = {
  "brightness": {
    color: "#9D4EDD",
    yMin: 'auto',
    yMax: 'auto',
  },
  "humidity": {
    color: "#560BAD",
    yMin: 'auto',
    yMax: 'auto',
  },
  "soil-moisture": {
    color: "#3F37C9",
    yMin: 'auto',
    yMax: 'auto',
  },
  "temperature": {
    color: "#4895EF",
    yMin: 'auto',
    yMax: 'auto',
  },
};

export function DataVisualizer() {
  const [customizations, setCustomizations] = useLocalStorage<{ [key: string]: GraphCustomization }>(
    "graphCustomizations",
    defaultCustomizations
  );

  const handleCustomizationChange = (id: string, newConfig: GraphCustomization) => {
    setCustomizations(prev => ({
      ...prev,
      [id]: newConfig,
    }));
  };

  return (
    <div className="w-full max-w-7xl mt-8">
      <Tabs defaultValue={endpoints[0].id} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          {endpoints.map((endpoint) => (
            <TabsTrigger key={endpoint.id} value={endpoint.id}>
              {endpoint.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {endpoints.map((endpoint) => (
          <TabsContent key={endpoint.id} value={endpoint.id} className="mt-4">
            <GraphCard
              endpoint={endpoint}
              customization={customizations[endpoint.id] || defaultCustomizations[endpoint.id]}
              onCustomizationChange={(newConfig) => handleCustomizationChange(endpoint.id, newConfig)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
