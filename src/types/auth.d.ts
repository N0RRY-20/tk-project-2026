export type AuthFormState = {
  status?: string;
  role?: string;
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
};

export type SignOutState = {
  success: boolean;
  error?: string;
};

export type UpdateProfileState = {
  success: boolean;
  error?: string;
};
