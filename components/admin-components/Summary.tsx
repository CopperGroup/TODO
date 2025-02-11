"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download } from "lucide-react";

// Define types for the summary and chart data
interface Summary {
  totalTasks: number;
  completedTasks: number;
  activeMembers: number;
  completionRate: string;
  backlogTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  otherColumnsTasks: Record<string, number>; // Add other columns dynamically
}

interface ChartData {
  name: string;
  Tasks: number;
}

export default function Summary({ data }: { data: Summary }) {
  const [summary, setSummary] = useState<Summary | null>(data);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (summary) {
      const updatedChartData: ChartData[] = [
        { name: "Backlog", Tasks: summary.backlogTasks },
        { name: "TODO", Tasks: summary.todoTasks },
        { name: "In Progress", Tasks: summary.inProgressTasks },
        { name: "Done", Tasks: summary.completedTasks },
      ];

      // Dynamically add other columns to the chart
      Object.keys(summary.otherColumnsTasks).forEach((columnName) => {
        updatedChartData.push({ name: columnName, Tasks: summary.otherColumnsTasks[columnName] });
      });

      setChartData(updatedChartData);
    }
  }, [summary]);

  if (!summary) return <p>Loading...</p>;

  return (
    <div className="w-full flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-auto p-6">
        <div className="w-full flex gap-2 justify-end">
          <Button className="coppergroup-gradient text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> New Task
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pt-6">
          <Card className="coppergroup-border">
            <CardHeader>
              <CardTitle>Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalTasks}</div>
            </CardContent>
          </Card>
          <Card className="coppergroup-border">
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.completedTasks}</div>
            </CardContent>
          </Card>
          <Card className="coppergroup-border">
            <CardHeader>
              <CardTitle>Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activeMembers}</div>
            </CardContent>
          </Card>
          <Card className="coppergroup-border">
            <CardHeader>
              <CardTitle>Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.completionRate}%</div>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-6 coppergroup-border">
          <CardHeader>
            <CardTitle>Task Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Tasks" fill="#D47800" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
