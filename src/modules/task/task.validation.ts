import { ZodType, z } from 'zod';

export class TaskValidation {
  static readonly CREATE: ZodType = z.object({
    userId: z.number().positive(),
    task: z.string().min(1, {
      message: 'Deskripsi tugas tidak boleh kosong.'
    })
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive(),
    task: z.string().min(1, {
      message: 'Deskripsi tugas tidak boleh kosong.'
    }).optional(),
    status: z.enum(['SELESAI', 'BELUM_SELESAI']).optional(),
    isDeleted: z.boolean().optional(),
  }) 
}