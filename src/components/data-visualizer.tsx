"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { GraphCard } from "@/components/graph-card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { EndpointConfig, GraphCustomization } from "@/types";
import { OverviewGraphCard } from "@/components/overview-graph-card";

const groupEndpoints = [
  { id: "1", topicId: "1955527637022093313" },
  { id: "2", topicId: "1960179631955456001" },
  { id: "3", topicId: "1960179997413552129" },
  { id: "4", topicId: "1960180059019489281" },
  { id: "5", topicId: "1960183337870503937" },
  { id: "6", topicId: "1960184873619107841" },
  { id: "7", topicId: "1960184898717822977" },
  { id: "8", topicId: "1960184928384135170" },
  { id: "9", topicId: "1960184953591902209" },
  { id: "10", topicId: "1960184977398771714" },
  { id: "11", topicId: "1960185639821979649" },
  { id: "12", topicId: "1960185739742883842" },
  { id: "13", topicId: "1960185772777222145" },
  { id: "14", topicId: "1960185806969188353" },
  { id: "15", topicId: "1960185838829121538" },
];

const buildUrl = (topicId: string) => `https://smartiot.space/api/iot/iotTopicData/deviceUpdateDataList?topicId=${topicId}`;

const sensorTypes: Omit<EndpointConfig, "url">[] = [
  {
    id: "brightness",
    name: "Brightness",
    dataKey: "data1",
    yAxisLabel: "Brightness (lux)",
  },
  {
    id: "humidity",
    name: "Humidity",
    dataKey: "data2",
    yAxisLabel: "Humidity (%)",
  },
  {
    id: "soil-moisture",
    name: "Soil Moisture",
    dataKey: "data3",
    yAxisLabel: "Moisture",
  },
  {
    id: "temperature",
    name: "Temperature",
    dataKey: "data4",
    yAxisLabel: "Temp (°C)",
  },
];

const defaultCustomizations: { [key: string]: GraphCustomization } = {
  "brightness": { color: "#FFC300", yMin: 'auto', yMax: 'auto' }, // Yellow
  "humidity": { color: "#FFFFFF", yMin: 'auto', yMax: 'auto' }, // White
  "soil-moisture": { color: "#FF5733", yMin: 'auto', yMax: 'auto' }, // Orange
  "temperature": { color: "#FF69B4", yMin: 'auto', yMax: 'auto' }, // Pink
};

export function DataVisualizer() {
  const [selectedGroup, setSelectedGroup] = useState(groupEndpoints[0]);
  const [customizations, setCustomizations] = useLocalStorage<{ [key: string]: GraphCustomization }>(
    "graphCustomizations",
    defaultCustomizations
  );

  const handleCustomizationChange = (id: string, newConfig: GraphCustomization) => {
    setCustomizations(prev => ({ ...prev, [id]: newConfig }));
  };

  const selectedUrl = buildUrl(selectedGroup.topicId);
  const endpointsForGroup = sensorTypes.map(sensor => ({
      ...sensor,
      url: selectedUrl
  }));

  return (
    <div className="w-full max-w-7xl mt-8">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="grid w-full max-w-xs items-center gap-1.5">
          <Label htmlFor="group-select">Select a Group</Label>
          <Select
            value={selectedGroup.id}
            onValueChange={(groupId) => {
              const group = groupEndpoints.find(g => g.id === groupId);
              if (group) {
                setSelectedGroup(group);
              }
            }}
          >
            <SelectTrigger id="group-select">
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {groupEndpoints.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  Group {group.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {sensorTypes.map((sensor) => (
            <TabsTrigger key={sensor.id} value={sensor.id}>
              {sensor.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewGraphCard
            url={selectedUrl}
            endpoints={endpointsForGroup}
            customizations={customizations}
          />
        </TabsContent>

        {endpointsForGroup.map((endpoint) => (
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
