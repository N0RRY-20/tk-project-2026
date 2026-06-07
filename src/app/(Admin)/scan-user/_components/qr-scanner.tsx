"use client";

import * as React from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { AlertTriangle, CheckCircle, Camera, Loader2 } from "lucide-react";
import type { IScannerError, IDetectedBarcode } from "@yudiel/react-qr-scanner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CameraStatus = "active" | "error";

interface QrScannerProps {
  onScan: (value: string) => void;
  isSearching?: boolean;
}

export function QrScanner({ onScan, isSearching }: QrScannerProps) {
  const [isCameraStarted, setIsCameraStarted] = React.useState(false);
  const [cameraStatus, setCameraStatus] =
    React.useState<CameraStatus>("active");
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleScan = React.useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      setCameraStatus("active");
      const value = detectedCodes[0]?.rawValue;
      if (value) {
        onScan(value);
      }
    },
    [onScan],
  );

  const handleError = React.useCallback((err: IScannerError) => {
    const messages: Record<string, string> = {
      "permission-denied":
        "Izin kamera ditolak. Izinkan akses kamera di pengaturan browser.",
      "no-camera": "Tidak ditemukan kamera pada perangkat ini.",
      "in-use": "Kamera sedang digunakan oleh aplikasi lain.",
      overconstrained: "Kamera tidak sesuai dengan constraint yang diminta.",
      "insecure-context":
        "Akses kamera hanya tersedia di koneksi HTTPS atau localhost.",
      unsupported: "Browser tidak mendukung akses kamera.",
      aborted: "Akses kamera dibatalkan.",
      security: "Akses kamera diblokir oleh keamanan browser.",
      "type-error": "Terjadi kesalahan tipe saat mengakses kamera.",
    };

    setErrorMessage(
      messages[err.kind] || err.message || "Gagal mengakses kamera.",
    );
    setCameraStatus("error");
  }, []);

  const highlightCodeOnCanvas = (
    detectedCodes: IDetectedBarcode[],
    ctx: CanvasRenderingContext2D,
  ) => {
    for (const code of detectedCodes) {
      const { x, y, width, height } = code.boundingBox;
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="font-semibold">Scan QR Code</p>
        <p className="text-sm">Arahkan kamera ke QR code pengguna</p>
      </div>

      <div
        className="w-full relative flex items-center justify-center"
        style={{ height: "60vh", maxHeight: "400px" }}
      >
        {!isCameraStarted ? (
          <div className="flex flex-col items-center gap-3">
            <Camera />
            <p>Kamera belum dimulai</p>
            <Button onClick={() => setIsCameraStarted(true)}>
              Mulai Kamera
            </Button>
          </div>
        ) : (
          <Scanner
            onScan={handleScan}
            onError={handleError}
            constraints={{ facingMode: "environment" }}
            formats={["qr_code"]}
            components={{
              finder: true,
              torch: true,
              zoom: true,
              tracker: highlightCodeOnCanvas,
            }}
            allowMultiple
            scanDelay={1000}
            sound
            styles={{
              container: { width: "100%", height: "100%" },
              video: { objectFit: "cover" },
            }}
          />
        )}
      </div>

      {!isCameraStarted ? null : isSearching ? (
        <Badge variant="default">
          <Loader2 />
          Mencari data...
        </Badge>
      ) : cameraStatus === "active" ? (
        <Badge variant="success">
          <CheckCircle />
          Kamera aktif
        </Badge>
      ) : (
        <Badge variant="destructive">
          <AlertTriangle />
          {errorMessage}
        </Badge>
      )}
    </div>
  );
}
