import { ZodType, z } from 'zod';

export class AuthValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z.string().min(1, {
      message: 'Nama tidak boleh kosong.'
    }).max(100),
    email: z.string().email({
      message: 'Masukan alamat email yang valid.'
    }),
    password: z.string().min(8, {
      message: 'Kata sandi diperlukan. Minimal 8 karakter.'
    }).regex(/[A-Z]/, {
      message: 'Kata sandi harus mengandung setidaknya satu huruf kapital.'
    }).regex(/[0-9]/, {
      message: 'Kata sandi harus mengandung setidaknya satu angka.'
    }).max(100),
  });

  static readonly VALIDATEUSER: ZodType = z.object({
    email: z.string().min(1),
    name: z.string().min(1),
    image: z.string().min(1),
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1).optional(),
    provider: z.string().min(1),
    providerAccountId: z.string().min(1)
  }) 

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email({
      message: 'Masukan alamat email yang valid.'
    }),
    password: z.string().min(8, {
      message: 'Kata sandi salah.'
    }).regex(/[A-Z]/, {
      message: 'Kata sandi harus mengandung setidaknya satu huruf kapital.'
    }).regex(/[0-9]/, {
      message: 'Kata sandi harus mengandung setidaknya satu angka.'
    }).max(100),
  });
}