"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { QrScanner } from "./_components/qr-scanner";
import { ScanResult } from "./_components/scan-result";
import { getUserByQrCode } from "@/actions/admin/getUserByQrCode";

import type { UserRow } from "@/types/user";

interface ScannedUser extends UserRow {
  scannedAt: number;
}

const STORAGE_KEY = "scanned-users";

function loadFromStorage(): ScannedUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(users: ScannedUser[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    /* quota exceeded, ignore */
  }
}

export default function ScanUserPage() {
  const [scannedUsers, setScannedUsers] = React.useState<ScannedUser[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [unknownQr, setUnknownQr] = React.useState<string | null>(null);

  React.useEffect(() => {
    setScannedUsers(loadFromStorage());
  }, []);

  React.useEffect(() => {
    saveToStorage(scannedUsers);
  }, [scannedUsers]);

  React.useEffect(() => {
    if (unknownQr) {
      const timer = setTimeout(() => setUnknownQr(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [unknownQr]);

  const handleScan = React.useCallback(async (value: string) => {
    setIsSearching(true);
    const user = await getUserByQrCode(value);
    setIsSearching(false);

    if (!user) {
      setUnknownQr(value);
      return;
    }

    setScannedUsers((prev) => {
      const filtered = prev.filter((u) => u.id !== user.id);
      return [{ ...user, scannedAt: Date.now() }, ...filtered];
    });
  }, []);

  const clearHistory = React.useCallback(() => {
    setScannedUsers([]);
  }, []);

  return (
    <div className="mx-auto max-w-md p-4">
      <QrScanner onScan={handleScan} isSearching={isSearching} />

      {unknownQr ? (
        <div className="flex justify-center p-4">
          <Badge variant="destructive">
            <AlertCircle />
            QR {unknownQr} tidak dikenal
          </Badge>
        </div>
      ) : null}

      {scannedUsers.length > 0 ? (
        <ScanResult users={scannedUsers} onClear={clearHistory} />
      ) : null}
    </div>
  );
}
