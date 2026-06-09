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
  Loader2,
  Trash2,
  Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { getInitials } from "../../user-management/_components/columns";
import { getStudentAudioUrl } from "@/actions/scan/getStudentAudio";

import type { UserRow } from "@/types/user";

interface ScannedUser extends UserRow {
  scannedAt: number;
}

interface ScanResultProps {
  users: ScannedUser[];
  onClear: () => void;
}

interface AudioContextValue {
  playAudio: (url: string, id: string) => void;
  playingId: string | null;
}

const AudioContext = React.createContext<AudioContextValue | null>(null);

function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAudio = React.useCallback((url: string, id: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setPlayingId(id);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.addEventListener("ended", () => setPlayingId(null));
    audio.addEventListener("error", () => setPlayingId(null));
    audio.play().catch(() => setPlayingId(null));
  }, []);

  return (
    <AudioContext.Provider value={{ playAudio, playingId }}>
      {children}
    </AudioContext.Provider>
  );
}

function useAudio() {
  const ctx = React.useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}

function LatestUserCard({ user }: { user: ScannedUser }) {
  const { playAudio, playingId } = useAudio();
  const playing = playingId === user.id;
  const loadingRef = React.useRef(false);

  const play = React.useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const url = await getStudentAudioUrl(user.qrCode!);
      if (url) {
        playAudio(url, user.id);
      }
    } catch {
      // ignore
    }
    loadingRef.current = false;
  }, [user.qrCode, user.id, playAudio]);

  React.useEffect(() => {
    const timer = setTimeout(() => play(), 0);
    return () => clearTimeout(timer);
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

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function HistoryItem({ user }: { user: ScannedUser }) {
  const { playAudio, playingId } = useAudio();
  const playing = playingId === user.id;
  const [loading, setLoading] = React.useState(false);

  const handleClick = React.useCallback(async () => {
    if (loading || playing) return;
    setLoading(true);
    try {
      const url = await getStudentAudioUrl(user.qrCode!);
      if (url) {
        playAudio(url, user.id);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [user.qrCode, user.id, playAudio, loading, playing]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || playing}
      className="flex items-center gap-3 p-2 rounded-lg border w-full text-left hover:bg-muted/50 transition-colors disabled:opacity-60"
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {user.className
            ? user.className
            : user.nickname
              ? `@${user.nickname}`
              : null}
        </p>
      </div>
      <div className="text-xs text-muted-foreground shrink-0">
        {formatTime(user.scannedAt)}
      </div>
      {loading || playing ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
      ) : (
        <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}

function HistoryList({ users }: { users: ScannedUser[] }) {
  const history = users.slice(1);
  if (history.length === 0) return null;

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
        <Clock />
        Riwayat Scan ({history.length})
      </h4>
      <div className="space-y-2">
        {history.map((user) => (
          <HistoryItem key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

export function ScanResult({ users, onClear }: ScanResultProps) {
  const latestUser = users[0];

  return (
    <AudioProvider>
      <LatestUserCard
        key={`${latestUser.id}-${latestUser.scannedAt}`}
        user={latestUser}
      />

      <HistoryList users={users} />

      <div className="flex justify-center pt-4">
        <Button variant="ghost" size="sm" onClick={onClear}>
          <Trash2 />
          Hapus Semua
        </Button>
      </div>
    </AudioProvider>
  );
}
