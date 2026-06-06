import type { UserFormState, UserUpdateFormState } from "@/types/user";

export const USER_DEFAULTS = {
  name: "",
  email: "",
  password: "",
  role: "",
  nickname: "",
  gender: "",
  className: "",
} as const;

export const INITIAL_USER_FORM_STATE: UserFormState = {
  status: "idle",
  errors: {},
};

export const INITIAL_USER_UPDATE_STATE: UserUpdateFormState = {
  status: "idle",
  errors: {},
};
