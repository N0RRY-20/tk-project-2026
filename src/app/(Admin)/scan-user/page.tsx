"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { QrScanner } from "./_components/qr-scanner";
import { ScanResult } from "./_components/scan-result";
import { getUserByQrCode } from "@/actions/admin/getUserByQrCode";

import type { UserRow } from "@/types/user";

export default function ScanUserPage() {
  const [lastResult, setLastResult] = React.useState<{
    qrCode: string;
    user: UserRow | null;
  } | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    if (lastResult && !lastResult.user) {
      const timer = setTimeout(() => setLastResult(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastResult]);

  const handleScan = React.useCallback(async (value: string) => {
    setIsSearching(true);
    const user = await getUserByQrCode(value);
    setLastResult({ qrCode: value, user });
    setIsSearching(false);
  }, []);

  return (
    <div className="mx-auto max-w-md p-4">
      <QrScanner onScan={handleScan} isSearching={isSearching} />

      {lastResult ? (
        lastResult.user ? (
          <ScanResult user={lastResult.user} />
        ) : (
          <div className="flex justify-center p-4">
            <Badge variant="destructive">
              <AlertCircle />
              QR {lastResult.qrCode} tidak dikenal
            </Badge>
          </div>
        )
      ) : null}
    </div>
  );
}
