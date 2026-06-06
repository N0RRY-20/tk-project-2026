"use client"

import * as React from "react"
import { createColumns } from "./_components/columns"
import { dummyData, type UserRow } from "./_components/dummy-data"
import { DataTable } from "./_components/data-table"
import { UserDetailDrawer } from "./_components/user-detail-drawer"

export default function UserManagementPage() {
  const [selectedUser, setSelectedUser] = React.useState<UserRow | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const handleViewDetail = (user: UserRow) => {
    setSelectedUser(user)
    setDrawerOpen(true)
  }

  const columns = React.useMemo(
    () => createColumns(handleViewDetail),
    []
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={dummyData}
        title="User Management"
        addButtonLabel="Add User"
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
              { label: "Teacher", value: "teacher" },
              { label: "Staff", value: "staff" },
            ],
          },
        ]}
      />
      <UserDetailDrawer
        user={selectedUser}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  )
}
