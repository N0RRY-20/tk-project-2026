"use client";

import { useSortable } from "@dnd-kit/sortable";
import { type ColumnDef } from "@tanstack/react-table";
import { type UniqueIdentifier } from "@dnd-kit/core";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon, GripVerticalIcon } from "lucide-react";

import type { UserRow } from "./dummy-data";

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DragHandle({ id }: { id: UniqueIdentifier }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

export function createColumns(
  onViewDetail?: (user: UserRow) => void,
): ColumnDef<UserRow>[] {
  return [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            {row.original.image ? (
              <AvatarImage src={row.original.image} alt={row.original.name} />
            ) : null}
            <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.original.email}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        const variant =
          role === "admin"
            ? "default"
            : role === "teacher"
              ? "secondary"
              : "outline";
        return (
          <Badge variant={variant} className="capitalize">
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "nickname",
      header: "Nickname",
      cell: ({ row }) => (
        <span className={!row.original.nickname ? "text-muted-foreground" : ""}>
          {row.original.nickname || "\u2014"}
        </span>
      ),
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => {
        const isMale = row.original.gender === "laki-laki";
        return (
          <Badge
            variant={isMale ? "default" : "secondary"}
            className="capitalize"
          >
            {row.original.gender}
          </Badge>
        );
      },
    },
    {
      accessorKey: "className",
      header: "Class",
      cell: ({ row }) => {
        if (!row.original.className) {
          return <Badge variant="outline">-</Badge>;
        }
        return <Badge variant="outline">{row.original.className}</Badge>;
      },
    },
    {
      accessorKey: "qrCode",
      header: "QR Code",
      cell: ({ row }) => (
        <code className="text-xs text-muted-foreground">
          {row.original.qrCode.length > 16
            ? `${row.original.qrCode.slice(0, 16)}...`
            : row.original.qrCode}
        </code>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            >
              <EllipsisVerticalIcon />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewDetail?.(row.original)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
