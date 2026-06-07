import z from "zod";

export const updateProfileSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(6, "Min 6 characters")
      .or(z.literal(""))
      .optional(),
  })
  .refine((data) => !data.newPassword || data.currentPassword, {
    message: "Current password is required to set a new password",
    path: ["currentPassword"],
  });
