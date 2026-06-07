import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Shield,
  GraduationCap,
  UserPlus,
  ScanQrCode,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/actions/admin/dashboard";
import { DashboardCharts } from "./_components/dashboard-charts";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(date);
}

export default async function Dashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Users className="size-4" />
              Total Users
            </CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {stats.totalUsers}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Shield className="size-4" />
              Total Admins
            </CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {stats.totalAdmins}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <GraduationCap className="size-4" />
              Total Students
            </CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {stats.totalStudents}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <UserPlus className="size-4" />
              New This Month
            </CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {stats.newThisMonth}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <DashboardCharts stats={stats} />

      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-medium">Recent Users</h3>
          <Button asChild variant="ghost" size="sm">
            <Link href="/user-management">View All</Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.recentUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No users yet
                </TableCell>
              </TableRow>
            ) : (
              stats.recentUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === "admin" ? "destructive" : "outline"}
                    >
                      {u.role ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(u.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/user-management">
            <Users />
            Manage Users
          </Link>
        </Button>
      </div>
    </div>
  );
}
