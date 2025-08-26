
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { format, isValid } from "date-fns";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import type { ApiDataPoint, EndpointConfig, GraphCustomization } from "@/types";
import {
  ChartContainer,
  ChartTooltip as RechartsChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface OverviewGraphCardProps {
    url: string;
    endpoints: Omit<EndpointConfig, "url">[];
    customizations: { [key: string]: GraphCustomization };
}

interface OverviewChartDataPoint {
  time: string;
  [key: string]: number | string;
}

export function OverviewGraphCard({ url, endpoints, customizations }: OverviewGraphCardProps) {
  const [data, setData] = useState<OverviewChartDataPoint[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiResponse = await response.json();
      
      if (!apiResponse || !Array.isArray(apiResponse.data)) {
        throw new Error("Invalid API response format");
      }
      
      const apiData: ApiDataPoint[] = apiResponse.data;

      const chartData: OverviewChartDataPoint[] = apiData
        .map((item) => {
          try {
            const sanitizedTime = item.createTime.replace(/-/g, "/");
            const date = new Date(sanitizedTime);
            if (!isValid(date)) return null;

            const dataPoint: OverviewChartDataPoint = {
              time: sanitizedTime
            };

            let hasValidData = false;
            for (const endpoint of endpoints) {
                const value = item[endpoint.dataKey];
                if (value !== undefined && value !== null) {
                    dataPoint[endpoint.id] = Number(value);
                    hasValidData = true;
                }
            }
            return hasValidData ? dataPoint : null;

          } catch (e) {
            console.error("Failed to process data point:", item);
            return null;
          }
        })
        .filter((item): item is OverviewChartDataPoint => item !== null)
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
  }, [url, endpoints]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartConfig = useMemo(() => {
    const config: any = {};
    endpoints.forEach(endpoint => {
        config[endpoint.id] = {
            label: endpoint.name,
            color: customizations[endpoint.id]?.color || '#000000',
        };
    });
    return config;
  }, [endpoints, customizations]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                    {`A combined view of all sensor data over time.`}
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={fetchData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Refresh Data</span>
              </Button>
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
                                yAxisId="left"
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
                                            const date = new Date(payload[0].payload.time);
                                            if (isValid(date)) {
                                                return format(date, "MMM d, HH:mm:ss");
                                            }
                                        }
                                        return label;
                                    }}
                                />}
                            />
                            <Legend />
                            {endpoints.map(endpoint => (
                                <Line 
                                    key={endpoint.id}
                                    yAxisId="left"
                                    type="monotone" 
                                    dataKey={endpoint.id}
                                    name={endpoint.name}
                                    stroke={customizations[endpoint.id]?.color || '#000000'}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 8, strokeWidth: 2 }}
                                />
                            ))}
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
