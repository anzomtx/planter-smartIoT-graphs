"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, AlertCircle, RefreshCw } from "lucide-react";
import type { ApiDataPoint, ChartDataPoint, EndpointConfig, GraphCustomization, ParsedValue } from "@/types";
import {
  ChartContainer,
  ChartTooltip as RechartsChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface GraphCardProps {
  endpoint: EndpointConfig;
  customization: GraphCustomization;
  onCustomizationChange: (newConfig: GraphCustomization) => void;
}

export function GraphCard({ endpoint, customization, onCustomizationChange }: GraphCardProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [localCustomization, setLocalCustomization] = useState<GraphCustomization>(customization);

  useEffect(() => {
    setLocalCustomization(customization);
  }, [customization]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoint.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonResponse = await response.json();
      const apiData: ApiDataPoint[] = jsonResponse.data;

      const chartData: ChartDataPoint[] = apiData
        .map((item) => {
          try {
            const parsedValue: ParsedValue = JSON.parse(item.value);
            const value = parsedValue[endpoint.dataKey];
            if (value !== undefined) {
              return {
                time: item.updateTime,
                value: value,
              };
            }
          } catch (e) {
            console.error("Failed to parse value:", item.value);
          }
          return null;
        })
        .filter((item): item is ChartDataPoint => item !== null)
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      setData(chartData);
      setLastUpdated(new Date());
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint.url, endpoint.dataKey]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveCustomization = () => {
    onCustomizationChange(localCustomization);
  };
  
  const yAxisDomain = useMemo(() => {
    const min = localCustomization.yMin !== 'auto' && localCustomization.yMin !== '' ? Number(localCustomization.yMin) : 'auto';
    const max = localCustomization.yMax !== 'auto' && localCustomization.yMax !== '' ? Number(localCustomization.yMax) : 'auto';
    return [min, max];
  }, [localCustomization.yMin, localCustomization.yMax]);

  const chartConfig = useMemo(() => ({
    [endpoint.dataKey]: {
      label: endpoint.dataKey.toString(),
      color: localCustomization.color,
    },
  }), [endpoint.dataKey, localCustomization.color]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <CardTitle>{endpoint.name}</CardTitle>
                <CardDescription>
                    {`Showing ${endpoint.dataKey} data over time.`}
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Refresh Data</span>
              </Button>
              <Sheet>
                  <SheetTrigger asChild>
                      <Button variant="outline" size="icon">
                          <Settings className="h-4 w-4" />
                          <span className="sr-only">Customize Graph</span>
                      </Button>
                  </SheetTrigger>
                  <SheetContent>
                      <SheetHeader>
                      <SheetTitle>Customize Graph</SheetTitle>
                      <SheetDescription>
                          Adjust the appearance of the "{endpoint.name}" graph.
                      </SheetDescription>
                      </SheetHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="color" className="text-right">Color</Label>
                            <Input
                                id="color"
                                type="color"
                                value={localCustomization.color}
                                onChange={(e) => setLocalCustomization({ ...localCustomization, color: e.target.value })}
                                className="col-span-3 p-1 h-10"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="yMin" className="text-right">Y-Min</Label>
                            <Input
                                id="yMin"
                                type="text"
                                placeholder="auto"
                                value={localCustomization.yMin}
                                onChange={(e) => setLocalCustomization({ ...localCustomization, yMin: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="yMax" className="text-right">Y-Max</Label>
                            <Input
                                id="yMax"
                                type="text"
                                placeholder="auto"
                                value={localCustomization.yMax}
                                onChange={(e) => setLocalCustomization({ ...localCustomization, yMax: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                      </div>
                      <SheetFooter>
                      <SheetClose asChild>
                          <Button onClick={handleSaveCustomization}>Save changes</Button>
                      </SheetClose>
                      </SheetFooter>
                  </SheetContent>
              </Sheet>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
            {loading && (
                <div className="flex flex-col space-y-3 h-full w-full p-4">
                    <Skeleton className="h-[calc(100%-4rem)] w-full rounded-xl" />
                    <div className="space-y-2 mt-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            )}
            {error && (
                <div className="flex items-center justify-center h-full">
                    <Alert variant="destructive" className="w-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            Failed to fetch data: {error}
                        </AlertDescription>
                    </Alert>
                </div>
            )}
            {!loading && !error && data.length > 0 && (
                <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis 
                                dataKey="time"
                                tickFormatter={(tick) => format(new Date(tick), 'HH:mm')}
                                tickLine={false}
                                axisLine={false}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                            />
                            <YAxis 
                                label={{ value: endpoint.yAxisLabel, angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }, offset: -5 }}
                                domain={yAxisDomain}
                                tickLine={false}
                                axisLine={false}
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                            />
                            <RechartsChartTooltip
                                cursor={true}
                                content={<ChartTooltipContent 
                                    indicator="dot"
                                    labelFormatter={(label, payload) => {
                                        if (payload && payload.length > 0) {
                                            return format(new Date(payload[0].payload.time), "MMM d, HH:mm:ss");
                                        }
                                        return label;
                                    }}
                                />}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="value"
                                stroke={`var(--color-${endpoint.dataKey})`}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 8, strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}
            {!loading && !error && data.length === 0 && (
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available to display.</p>
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter>
          <p className="text-xs text-muted-foreground">
            {lastUpdated && `Last updated: ${format(lastUpdated, "MMM d, yyyy HH:mm:ss")}`}
          </p>
      </CardFooter>
    </Card>
  );
}
