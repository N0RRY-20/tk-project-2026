export interface UserRow {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string | null;
  nickname: string | null;
  gender: "laki-laki" | "perempuan" | null;
  classId: string | null;
  className: string | null;
  qrCode: string | null;
  audio_url: string | null;
  usia: string | null;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  alamat: string | null;
  namaAyah: string | null;
  namaIbu: string | null;
  pekerjaanAyah: string | null;
  pekerjaanIbu: string | null;
  noHp: string | null;
  tahunMasuk: string | null;
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
    classId?: string[];
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
    classId?: string[];
    qrCode?: string[];
    _form?: string[];
  };
};

export interface ClassRow {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  studentCount?: number;
}

export type UserDeleteResult = {
  success: boolean;
  error?: string;
};
