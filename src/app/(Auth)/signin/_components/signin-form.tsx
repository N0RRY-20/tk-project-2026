"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AUTH_DEFAULTS,
  INITIAL_AuthFormState,
} from "@/constants/auth-constant";
import { signInFormSchema } from "@/validations/auth-validation";
import { FormInput } from "@/components/common/form-input";
import { useEffect, useActionState, useTransition } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { signInAction } from "@/actions/auth/signin";

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: AUTH_DEFAULTS.signIn,
  });
  const router = useRouter();
  const [isPendingTransition, startTransition] = useTransition();
  const [state, action, isPending] = useActionState(
    signInAction,
    INITIAL_AuthFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Login berhasil!");
      if (state.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/profile");
      }
    } else if (state.status === "error") {
      const errorMsg = state.errors?.password?.[0] || "Terjadi kesalahan";
      toast.error(errorMsg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const onSubmit = form.handleSubmit(async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    startTransition(() => action(formData));
  });
  const isLoading = isPending || isPendingTransition;
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Email account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <FormInput
                control={form.control}
                name="email"
                label="Email"
                placeholder="Enter your email"
                type="email"
              />
              <FormInput
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
              />
              <Controller
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="rememberMe"
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="rememberMe">Remember me</FieldLabel>
                    </FieldContent>
                  </Field>
                )}
              />

              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : null}
                  Login
                </Button>
                <FieldDescription className="text-center">
                  untuk pendaftaran silahkan hubungi admin
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
