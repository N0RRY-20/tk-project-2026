import { AuthFormState, SignOutState } from "@/types/auth";

export const AUTH_DEFAULTS = {
  signIn: {
    email: "",
    password: "",
    rememberMe: false,
  },
} as const;

export const INITIAL_AuthFormState: AuthFormState = {
  status: "idle",
  errors: {
    email: [],
    password: [],
  },
} as const;

export const SIGNOUT_DEFAULTS: SignOutState = {
  success: false,
  error: "",
} as const;
