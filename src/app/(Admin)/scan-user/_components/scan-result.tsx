"use client";

import QRCode from "react-qr-code";
import { School, User, Shield, Users, CheckCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { getInitials } from "../../user-management/_components/columns";

import type { UserRow } from "@/types/user";

interface ScanResultProps {
  user: UserRow;
}

export function ScanResult({ user }: ScanResultProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 pt-8">
      <Badge variant="default">
        <CheckCircle />
        QR Terverifikasi
      </Badge>

      <Avatar>
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>

      <div className="text-center">
        <h3 className="font-semibold">{user.name}</h3>
        {user.nickname ? <p className="text-sm">@{user.nickname}</p> : null}
      </div>

      <div className="flex items-center gap-2">
        {user.className ? (
          <Badge variant="outline">
            <School />
            {user.className}
          </Badge>
        ) : null}

        {user.gender ? (
          <Badge
            variant={user.gender === "laki-laki" ? "default" : "secondary"}
          >
            <User />
            {user.gender}
          </Badge>
        ) : null}

        {user.role ? (
          <Badge variant={user.role === "admin" ? "destructive" : "outline"}>
            {user.role === "admin" ? <Shield /> : <Users />}
            {user.role}
          </Badge>
        ) : null}
      </div>

      <QRCode value={user.qrCode ?? ""} size={160} level="H" />
      {user.qrCode ? <p>{user.qrCode}</p> : null}
    </div>
  );
}
