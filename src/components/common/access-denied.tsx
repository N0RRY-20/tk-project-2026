import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-2xl font-bold">Akses Ditolak</h2>
      <p className="text-muted-foreground">
        Kamu tidak memiliki izin untuk mengakses halaman ini.
      </p>
      <Link href="/" className="text-primary underline">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
