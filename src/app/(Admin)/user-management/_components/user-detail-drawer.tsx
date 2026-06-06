"use client";

import * as React from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { UserRow } from "@/types/user";

import { getInitials } from "./columns";

interface UserDetailDrawerProps {
  user: UserRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailDrawer({
  user,
  open,
  onOpenChange,
}: UserDetailDrawerProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    if (!contentRef.current || !user) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(contentRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `user-detail-${user.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!user) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="shrink-0">
          <DrawerTitle>User Details</DrawerTitle>
          <DrawerDescription>Informasi detail pengguna</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="flex justify-center px-6 py-4">
            <div
              ref={contentRef}
              className="flex flex-col items-center gap-6 p-8 bg-white border-2 border-gray-200 rounded-2xl shadow-lg w-full max-w-100"
            >
              <Avatar className="size-24">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  {user.name}
                </h3>
              </div>
              {user.className ? (
                <Badge variant="default" className="text-sm">
                  {user.className}
                </Badge>
              ) : null}

              {user.qrCode ? (
                <div className="flex flex-col items-center gap-2">
                  <QRCode
                    value={user.qrCode}
                    size={200}
                    level="H"
                    className="border-4 border-white"
                  />
                  <code className="text-xs text-gray-500">{user.qrCode}</code>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <DrawerFooter className="shrink-0">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full"
          >
            <Download className="mr-2 size-4" />
            {isDownloading ? "Downloading..." : "Download PNG"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
