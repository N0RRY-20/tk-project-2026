"use client";

import * as React from "react";
import { useCallback, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { createColumns } from "./columns";
import type { UserRow } from "@/types/user";
import { DataTable } from "./data-table";
import { UserDetailDrawer } from "./user-detail-drawer";
import { AddUserSheet } from "./add-user-sheet";
import { EditUserSheet } from "./edit-user-sheet";
import { deleteUserAction } from "@/actions/admin/userDelete";
import { bulkDeleteUserAction } from "@/actions/admin/bulkDeleteUsers";
import { paginateUsers } from "@/actions/admin/listUsers";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

export function UserManagementClient() {
  const [isDeleting, startTransition] = useTransition();
  const [isLoading, startLoading] = useTransition();
  const [selectedUser, setSelectedUser] = React.useState<UserRow | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [addSheetOpen, setAddSheetOpen] = React.useState(false);
  const [editSheetOpen, setEditSheetOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<UserRow | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<UserRow | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = React.useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = React.useState<string[]>([]);
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");

  const fetchUsers = useCallback(() => {
    startLoading(async () => {
      const result = await paginateUsers({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        search: search || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      });
      setUsers(result.users);
      setTotal(result.total);
    });
  }, [pagination.pageIndex, pagination.pageSize, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewDetail = (user: UserRow) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleEdit = (user: UserRow) => {
    setEditUser(user);
    setEditSheetOpen(true);
  };

  const handleDelete = useCallback((user: UserRow) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!userToDelete) return;

      startTransition(async () => {
        const result = await deleteUserAction(userToDelete.id);

        if (result.success) {
          setDeleteConfirmOpen(false);
          setUserToDelete(null);
          toast.success("User deleted successfully");
          fetchUsers();
        } else {
          toast.error(result.error || "Failed to delete user");
        }
      });
    },
    [userToDelete, fetchUsers],
  );

  const handleBulkDelete = useCallback((ids: string[]) => {
    setBulkDeleteIds(ids);
    setBulkDeleteConfirmOpen(true);
  }, []);

  const handleBulkDeleteConfirm = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (bulkDeleteIds.length === 0) return;

      startTransition(async () => {
        const result = await bulkDeleteUserAction(bulkDeleteIds);

        setBulkDeleteConfirmOpen(false);
        setBulkDeleteIds([]);

        if (result.success) {
          toast.success(`${bulkDeleteIds.length} user(s) deleted`);
          fetchUsers();
        } else {
          toast.error(result.error || "Failed to delete users");
        }
      });
    },
    [bulkDeleteIds, fetchUsers],
  );

  const columns = React.useMemo(
    () => createColumns(handleViewDetail, handleEdit, handleDelete),
    [handleDelete],
  );

  const pageCount = Math.ceil(total / pagination.pageSize);

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        title="User"
        addButtonLabel="Add User"
        onAdd={() => setAddSheetOpen(true)}
        bulkDelete
        searchConfig={{ columnId: "name", placeholder: "Search name..." }}
        filterConfig={[
          {
            columnId: "role",
            label: "Role",
            options: [
              { label: "All", value: "all" },
              { label: "Admin", value: "admin" },
              { label: "Student", value: "student" },
            ],
          },
        ]}
        pageCount={pageCount}
        total={total}
        isLoading={isLoading}
        pagination={pagination}
        onPaginationChange={setPagination}
        onSearchChange={(value) => {
          setSearch(value);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
        onFilterChange={(columnId, value) => {
          if (columnId === "role") {
            setRoleFilter(value);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }
        }}
        onBulkDelete={handleBulkDelete}
      />
      <UserDetailDrawer
        user={selectedUser}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
      <AddUserSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        onSuccess={fetchUsers}
      />
      <EditUserSheet
        user={editUser}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSuccess={fetchUsers}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete User"
        description={
          <>
            Are you sure you want to delete{" "}
            <strong>{userToDelete?.name}</strong>? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />

      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
        title="Delete Selected Users"
        description={
          <>
            Are you sure you want to delete <strong>{bulkDeleteIds.length}</strong>{" "}
            user(s)? This action cannot be undone.
          </>
        }
        confirmLabel={`Delete ${bulkDeleteIds.length} user(s)`}
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleBulkDeleteConfirm}
      />
    </>
  );
}
