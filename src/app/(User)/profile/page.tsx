import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import QRCode from "react-qr-code";
import { School, UserIcon, Shield, Users } from "lucide-react";
import { ProfileActions } from "./_components/profile-actions";
import { getSessionUser } from "@/actions/auth/getSessionUser";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 p-6 dark:bg-black">
        <p className="text-muted-foreground">User tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 p-6 dark:bg-black">
      <div className="flex flex-col items-center gap-6">
        <Avatar className="size-24">
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback className="text-lg">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h1 className="text-xl font-bold">{user.name}</h1>
          {user.email ? (
            <p className="text-sm text-muted-foreground">{user.email}</p>
          ) : null}
          {user.nickname ? (
            <p className="text-sm text-muted-foreground">@{user.nickname}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {user.className ? (
            <Badge variant="outline">
              <School />
              {user.className}
            </Badge>
          ) : null}
          {user.gender ? (
            <Badge variant="secondary">
              <UserIcon />
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

        {user.qrCode ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-4">
            <QRCode value={user.qrCode} size={200} level="H" />
            <code className="text-xs text-gray-500">{user.qrCode}</code>
          </div>
        ) : null}

        <ProfileActions user={user} />
      </div>
    </div>
  );
}
