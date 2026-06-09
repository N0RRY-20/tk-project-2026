import { getClasses } from "@/actions/admin/class";
import { ClassManagementClient } from "./_components/class-management-client";

export default async function ClassesPage() {
  const classes = await getClasses();
  return <ClassManagementClient initialClasses={classes} />;
}
