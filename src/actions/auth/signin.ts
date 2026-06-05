"use server"

import { auth } from "@/lib/better-auth/auth";
import { AuthFormState } from "@/types/auth";
import { signInFormSchema } from "@/validations/auth-validation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

export async function signInAction(prevstate: AuthFormState, formData: FormData): Promise<AuthFormState> {
  try {
     const validatedFields = signInFormSchema.safeParse({
            email: formData.get('email'),
            password: formData.get('password'),
        });
         
    if (!validatedFields.success) {
        return {
            status: 'error',
            errors: z.flattenError(validatedFields.error).fieldErrors,
        };
    }
    const { user } = await auth.api.signInEmail({
      body: {
        email: validatedFields.data.email,
        password: validatedFields.data.password,
        rememberMe: formData.get("rememberMe") === "true",
      },
      headers: await headers(),
    });

    if (user) {
       revalidatePath('/', 'layout');
      return {
        status: "success",
      }
    }

    return {
      status: "error",
      errors: {
        email: [],
        password: [],
      },
    };
  } catch (error) {
    return {
      status: "error",
      errors: {
        email: [],
        password: ["Email atau password salah"],
        _form: [error instanceof Error ? error.message : "Terjadi kesalahan"],
      },
    };
  }
}
