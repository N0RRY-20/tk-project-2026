"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, School, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

import { createClass, updateClass, deleteClass } from "@/actions/admin/class";
import { ManageStudentsDrawer } from "./manage-students-drawer";
import type { ClassRow } from "@/types/user";

export function ClassManagementClient({
  initialClasses,
}: {
  initialClasses: ClassRow[];
}) {
  const router = useRouter();
  const [classes, setClasses] = React.useState(initialClasses);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingClass, setEditingClass] = React.useState<ClassRow | null>(null);
  const [className, setClassName] = React.useState("");
  const [classNameError, setClassNameError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<ClassRow | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const [manageDrawerOpen, setManageDrawerOpen] = React.useState(false);
  const [managingClass, setManagingClass] = React.useState<ClassRow | null>(
    null,
  );

  const openAddDialog = () => {
    setEditingClass(null);
    setClassName("");
    setClassNameError("");
    setDialogOpen(true);
  };

  const openEditDialog = (cls: ClassRow) => {
    setEditingClass(cls);
    setClassName(cls.name);
    setClassNameError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const trimmed = className.trim();
    if (!trimmed) {
      setClassNameError("Nama kelas wajib diisi");
      return;
    }
    setClassNameError("");
    setIsSaving(true);
    try {
      if (editingClass) {
        await updateClass(editingClass.id, trimmed);
        toast.success("Kelas diperbarui");
      } else {
        await createClass(trimmed);
        toast.success("Kelas dibuat");
      }
      setDialogOpen(false);
      setClasses(await (await import("@/actions/admin/class")).getClasses());
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan kelas");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteClass(deleteTarget.id);
      toast.success("Kelas dihapus");
      setDeleteOpen(false);
      setDeleteTarget(null);
      setClasses(await (await import("@/actions/admin/class")).getClasses());
      router.refresh();
    } catch {
      toast.error("Gagal menghapus kelas");
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Kelas</h1>
          <p className="text-sm text-muted-foreground">Kelola kelas siswa</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus />
          Tambah Kelas
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Kelas</CardTitle>
          <CardDescription>Total {classes.length} kelas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Siswa</TableHead>
                <TableHead className="w-24">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-8"
                  >
                    <School className="mx-auto size-8 mb-2 opacity-50" />
                    Kelas belum tersedia. Klik &quot;Tambah Kelas&quot; untuk
                    membuat kelas baru.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cls.studentCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setManagingClass(cls);
                            setManageDrawerOpen(true);
                          }}
                        >
                          <Users className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(cls)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteTarget(cls);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingClass ? "Edit Kelas" : "Tambah Kelas"}
            </DialogTitle>
            <DialogDescription>
              {editingClass
                ? "Perbarui nama kelas"
                : "Masukkan nama untuk kelas baru"}
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="class-name">Nama Kelas</FieldLabel>
            <Input
              id="class-name"
              value={className}
              onChange={(e) => {
                setClassName(e.target.value);
                setClassNameError("");
              }}
              placeholder="Contoh: TK A"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              autoFocus
            />
            {classNameError ? (
              <FieldError errors={[{ message: classNameError }]} />
            ) : null}
          </Field>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              {editingClass ? "Perbarui" : "Buat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Kelas"
        description={
          deleteTarget
            ? `Apakah Anda yakin ingin menghapus "${deleteTarget.name}"? Semua siswa di kelas ini akan tidak memiliki kelas.`
            : ""
        }
        confirmLabel="Hapus"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {managingClass ? (
        <ManageStudentsDrawer
          classId={managingClass.id}
          className={managingClass.name}
          open={manageDrawerOpen}
          onOpenChange={(open) => {
            setManageDrawerOpen(open);
            if (!open) setManagingClass(null);
          }}
          onSaved={async () => {
            setClasses(
              await (await import("@/actions/admin/class")).getClasses(),
            );
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
