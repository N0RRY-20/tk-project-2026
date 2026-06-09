"use client";

import * as React from "react";
import { Search, Loader2, Check } from "lucide-react";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import {
  getStudentsForBulkAssign,
  bulkAssignStudents,
} from "@/actions/admin/class";
import { toast } from "sonner";

interface StudentItem {
  id: string;
  name: string;
  email: string;
  image: string | null;
  nickname: string | null;
  gender: string | null;
  classId: string | null;
  className: string | null;
}

interface ManageStudentsDrawerProps {
  classId: string;
  className: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

interface State {
  status: "loading" | "loaded" | "error";
  students: StudentItem[];
  selectedIds: Set<string>;
  originalIds: Set<string>;
}

type Action =
  | { type: "loaded"; students: StudentItem[]; classId: string }
  | { type: "error" }
  | { type: "toggle"; id: string }
  | { type: "toggleAll"; ids: string[]; checked: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loaded": {
      const ids = new Set(
        action.students
          .filter((s) => s.classId === action.classId)
          .map((s) => s.id),
      );
      return {
        status: "loaded",
        students: action.students,
        selectedIds: new Set(ids),
        originalIds: new Set(ids),
      };
    }
    case "error":
      return { ...state, status: "error" };
    case "toggle": {
      const next = new Set(state.selectedIds);
      if (next.has(action.id)) {
        next.delete(action.id);
      } else {
        next.add(action.id);
      }
      return { ...state, selectedIds: next };
    }
    case "toggleAll": {
      const next = new Set(state.selectedIds);
      for (const id of action.ids) {
        if (action.checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return { ...state, selectedIds: next };
    }
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ManageStudentsDrawer({
  classId,
  className: classNameLabel,
  open,
  onOpenChange,
  onSaved,
}: ManageStudentsDrawerProps) {
  const [state, dispatch] = React.useReducer(reducer, {
    status: "loading" as const,
    students: [] as StudentItem[],
    selectedIds: new Set<string>(),
    originalIds: new Set<string>(),
  });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    getStudentsForBulkAssign()
      .then((students) =>
        dispatch({ type: "loaded", students, classId }),
      )
      .catch(() => {
        dispatch({ type: "error" });
        toast.error("Failed to load students");
      });
  }, [open, classId]);

  const filtered = React.useMemo(() => {
    if (!searchQuery.trim()) return state.students;
    const q = searchQuery.toLowerCase();
    return state.students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.nickname && s.nickname.toLowerCase().includes(q)),
    );
  }, [state.students, searchQuery]);

  const toggleStudent = (id: string) => {
    dispatch({ type: "toggle", id });
  };

  const toggleAll = () => {
    const checked = !filtered.every((s) => state.selectedIds.has(s.id));
    dispatch({
      type: "toggleAll",
      ids: filtered.map((s) => s.id),
      checked,
    });
  };

  const allFilteredSelected =
    filtered.length > 0 &&
    filtered.every((s) => state.selectedIds.has(s.id));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const toAdd = [...state.selectedIds].filter(
        (id) => !state.originalIds.has(id),
      );
      const toRemove = [...state.originalIds].filter(
        (id) => !state.selectedIds.has(id),
      );

      if (toAdd.length > 0) {
        await bulkAssignStudents(classId, toAdd);
      }
      if (toRemove.length > 0) {
        await bulkAssignStudents(null, toRemove);
      }

      toast.success(
        `${toAdd.length > 0 ? `${toAdd.length} added` : ""}${toAdd.length > 0 && toRemove.length > 0 ? ", " : ""}${toRemove.length > 0 ? `${toRemove.length} removed` : ""}${toAdd.length === 0 && toRemove.length === 0 ? "No changes" : ""}`,
      );
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    state.originalIds.size !== state.selectedIds.size ||
    [...state.originalIds].some((id) => !state.selectedIds.has(id));

  const getClassBadge = (
    studentClassId: string | null,
    studentClassName: string | null,
  ) => {
    if (studentClassId === classId) {
      return (
        <Badge className="bg-green-600 text-white border-none text-[10px] leading-none px-1.5 py-0.5">
          Current
        </Badge>
      );
    }
    if (!studentClassId) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] leading-none px-1.5 py-0.5 text-muted-foreground"
        >
          Unassigned
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="text-[10px] leading-none px-1.5 py-0.5"
      >
        {studentClassName}
      </Badge>
    );
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="shrink-0 border-b">
          <DrawerTitle>Manage Students — {classNameLabel}</DrawerTitle>
          <DrawerDescription>
            Select students to assign to this class
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 py-3 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {state.status === "loading" ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {searchQuery
                ? "No students match your search"
                : "No students found"}
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((student) => {
                const checked = state.selectedIds.has(student.id);
                return (
                  <label
                    key={student.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.nickname
                          ? `@${student.nickname}`
                          : student.email}
                      </p>
                    </div>
                    {getClassBadge(student.classId, student.className)}
                    {checked ? (
                      <Check className="size-4 shrink-0 text-primary" />
                    ) : null}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <DrawerFooter className="shrink-0 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-2">
            <span>
              {filtered.length !== state.students.length
                ? `Showing ${filtered.length} of ${state.students.length} students`
                : `${state.students.length} students`}
            </span>
            {state.students.length > 0 ? (
              <button
                type="button"
                onClick={toggleAll}
                className="underline hover:text-foreground transition-colors"
              >
                {allFilteredSelected ? "Deselect all" : "Select all"}
              </button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
            </DrawerClose>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={!hasChanges || isSaving || state.status === "loading"}
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin mr-1" />
              ) : null}
              Save Changes
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
