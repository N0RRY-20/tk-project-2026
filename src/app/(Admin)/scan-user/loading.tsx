import { Skeleton } from "@/components/ui/skeleton";

export default function ScanUserLoading() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-5 w-40" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>
      <Skeleton
        className="w-full rounded-lg"
        style={{ minHeight: "300px", maxHeight: "400px" }}
      />
    </div>
  );
}
