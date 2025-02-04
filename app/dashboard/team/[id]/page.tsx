"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { PlusCircle, Download } from "lucide-react"

const data = [
  { name: "Jan", Tasks: 40, Completed: 24 },
  { name: "Feb", Tasks: 30, Completed: 13 },
  { name: "Mar", Tasks: 20, Completed: 18 },
  { name: "Apr", Tasks: 27, Completed: 22 },
  { name: "May", Tasks: 18, Completed: 9 },
  { name: "Jun", Tasks: 23, Completed: 15 },
]

export default function Summary() {
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">158</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card className="coppergroup-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">101</div>
              <p className="text-xs text-muted-foreground">+10.5% from last month</p>
            </CardContent>
          </Card>
          <Card className="coppergroup-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 new members this month</p>
            </CardContent>
          </Card>
          <Card className="coppergroup-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">63.9%</div>
              <p className="text-xs text-muted-foreground">+5.4% from last month</p>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-6 coppergroup-border">
          <CardHeader>
            <CardTitle>Task Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Tasks" fill="#D47800" />
                <Bar dataKey="Completed" fill="#FFB366" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

