import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";

import AccessDenied from "./common/access-denied";

export async function AdminGuard({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
