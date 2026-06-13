import z from "zod";

export const addUserFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.string().min(1, "Role is required"),
    nickname: z.string().optional(),
    gender: z.string().optional(),
    classId: z.string().optional(),
  })
  .refine(
    (data) => {
      const validRoles = ["admin", "student"];
      return validRoles.includes(data.role);
    },
    {
      message: "Please select a valid role",
      path: ["role"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "student") {
        return data.gender === "laki-laki" || data.gender === "perempuan";
      }
      return true;
    },
    {
      message: "Gender is required for students",
      path: ["gender"],
    },
  );

export const updateUserFormSchema = z
  .object({
    id: z.string().min(1, "User ID is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .union([
        z.string().min(8, "Password must be at least 8 characters"),
        z.literal(""),
      ])
      .optional(),
    role: z.string().min(1, "Role is required"),
    nickname: z.string().optional(),
    gender: z.string().optional(),
    classId: z.string().optional(),
  })
  .refine(
    (data) => {
      const validRoles = ["admin", "student"];
      return validRoles.includes(data.role);
    },
    {
      message: "Please select a valid role",
      path: ["role"],
    },
  )
  .refine(
    (data) => {
      if (data.role === "student") {
        return data.gender === "laki-laki" || data.gender === "perempuan";
      }
      return true;
    },
    {
      message: "Gender is required for students",
      path: ["gender"],
    },
  );
