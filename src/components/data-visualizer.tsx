"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraphCard } from "@/components/graph-card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { EndpointConfig, GraphCustomization } from "@/types";

const endpoints: EndpointConfig[] = [
  {
    id: "temp-sensor",
    name: "Temperature Sensor",
    url: "https://smartiot.space/api/iot/iotTopicData/deviceUpdateDataList?topicId=1955527637022093313",
    dataKey: "temperature",
    yAxisLabel: "Temp (°C)",
  },
  {
    id: "air-quality",
    name: "Air Quality Sensor",
    url: "https://smartiot.space/api/iot/iotTopicData/deviceUpdateDataList?topicId=1960179631955456001",
    dataKey: "co2",
    yAxisLabel: "CO₂ (ppm)",
  },
];

const defaultCustomizations: { [key: string]: GraphCustomization } = {
  "temp-sensor": {
    color: "#9D4EDD",
    yMin: 'auto',
    yMax: 'auto',
  },
  "air-quality": {
    color: "#560BAD",
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
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
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
