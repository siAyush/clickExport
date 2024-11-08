"use client";

import React, { useState, useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface TimeSeriesData {
  timestamp: string;
  value: number;
}

export default function TimeSeriesChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<[number[], number[]]>([[], []]);
  const [aggregateMetric, setAggregateMetric] = useState("all");
  const [uPlotInstance, setUPlotInstance] = useState<uPlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [aggregateMetric]);

  useEffect(() => {
    if (data[0].length > 0 && chartRef.current) {
      const options = {
        width: 800,
        height: 400,
        title: "Time Series Data",
        series: [
          {
            label: "Time",
            value: (u: uPlot, v: number) => new Date(v * 1000).toLocaleString(),
          },
          {
            label: "Value",
            stroke: "blue",
            fill: "rgba(0, 0, 255, 0.1)",
          },
        ],
      };

      if (uPlotInstance) {
        uPlotInstance.setData(data);
      } else {
        const newChart = new uPlot(options, data, chartRef.current);
        setUPlotInstance(newChart);
      }
    }
  }, [data]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        aggregate: aggregateMetric === "all" ? "" : aggregateMetric,
      }).toString();

      const url = `http://localhost:8000/metrics/query${
        queryParams ? `?${queryParams}` : ""
      }`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const apiData: TimeSeriesData[] = await response.json();

      const plotData: [number[], number[]] = [
        apiData.map((item) => new Date(item.timestamp).getTime() / 1000),
        apiData.map((item) => item.value),
      ];

      setData(plotData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetricChange = async (value: string) => {
    setAggregateMetric(value);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-4xl p-6 space-y-6 bg-card rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-foreground">
          Time Series Chart
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="aggregateMetric">Aggregate Metric</Label>
            <Select value={aggregateMetric} onValueChange={handleMetricChange}>
              <SelectTrigger id="aggregateMetric">
                <SelectValue placeholder="Select aggregate metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="avg">Average</SelectItem>
                <SelectItem value="sum">Sum</SelectItem>
                <SelectItem value="max">Max</SelectItem>
                <SelectItem value="min">Min</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={fetchData} className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : "Refresh Data"}
            </Button>
          </div>
        </div>
        <div ref={chartRef} className="w-full overflow-x-auto"></div>
      </div>
    </div>
  );
}
