import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-4">
      <Skeleton className="size-10 rounded-full" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
