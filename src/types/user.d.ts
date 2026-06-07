export interface UserRow {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string | null;
  nickname: string | null;
  gender: "laki-laki" | "perempuan" | null;
  className: string | null;
  qrCode: string | null;
  audio_url: string | null;
}
export type UserFormState = {
  status?: "idle" | "success" | "error";
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    nickname?: string[];
    gender?: string[];
    className?: string[];
    qrCode?: string[];
    _form?: string[];
  };
};

export type UserUpdateFormState = {
  status?: "idle" | "success" | "error";
  errors?: {
    id?: string[];
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    nickname?: string[];
    gender?: string[];
    className?: string[];
    qrCode?: string[];
    _form?: string[];
  };
};

export type UserDeleteResult = {
  success: boolean;
  error?: string;
};
