"use client";

import * as React from "react";
import QRCode from "react-qr-code";
import {
  School,
  User,
  Shield,
  Users,
  CheckCircle,
  Volume2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { getInitials } from "../../user-management/_components/columns";
import { getStudentAudioUrl } from "@/actions/scan/getStudentAudio";

import type { UserRow } from "@/types/user";

interface ScanResultProps {
  user: UserRow;
}

export function ScanResult({ user }: ScanResultProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);

  const play = React.useCallback(async () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    setPlaying(true);
    try {
      const url = await getStudentAudioUrl(user.qrCode!);
      if (!url) {
        setPlaying(false);
        return;
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.addEventListener("ended", () => setPlaying(false));
      audio.addEventListener("error", () => setPlaying(false));
      audio.play().catch((err) => {
        console.error("Play gagal:", err); // debug di sini
        setPlaying(false);
      });
    } catch (err) {
      console.error("Error occurred while playing audio:", err);
      setPlaying(false);
    }
  }, [user.qrCode]);

  React.useEffect(() => {
    const timer = setTimeout(() => play(), 0);
    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [play]);
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

      <Button variant="outline" size="icon" onClick={play} disabled={playing}>
        <Volume2 />
      </Button>

      <QRCode value={user.qrCode ?? ""} size={160} level="H" />
      {user.qrCode ? <p>{user.qrCode}</p> : null}
    </div>
  );
}
