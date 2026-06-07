"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { DashboardStats } from "@/actions/admin/dashboard";

const roleConfig = {
  admin: { label: "Admin", color: "hsl(0 72% 51%)" },
  student: { label: "Student", color: "hsl(142 71% 45%)" },
} satisfies ChartConfig;

export function DashboardCharts({ stats }: { stats: DashboardStats }) {
  const roleData = [
    { role: "admin", count: stats.totalAdmins, fill: "hsl(0 72% 51%)" },
    {
      role: "student",
      count: stats.totalStudents,
      fill: "hsl(142 71% 45%)",
    },
  ];

  const classData = stats.classDistribution
    .filter((item) => item.className)
    .map((item) => ({
      class: item.className!,
      count: item.count,
    }));

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
      <div className="rounded-lg border p-4 overflow-hidden">
        <h3 className="mb-4 text-sm font-medium">Role Distribution</h3>
        <ChartContainer config={roleConfig} className="max-h-64 w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="role" />}
            />
            <ChartLegend content={<ChartLegendContent nameKey="role" />} />
            <Pie
              data={roleData}
              dataKey="count"
              nameKey="role"
              cx="50%"
              cy="50%"
              outerRadius={60}
            />
          </PieChart>
        </ChartContainer>
      </div>

      <div className="rounded-lg border p-4 overflow-hidden">
        <h3 className="mb-4 text-sm font-medium">Students by Class</h3>
        <ChartContainer
          config={{} satisfies ChartConfig}
          className="max-h-64 w-full"
        >
          <BarChart data={classData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="class" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <ChartTooltip
              content={<ChartTooltipContent nameKey="class" />}
            />
            <Bar dataKey="count" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
