import {z} from 'zod';

export const registerSchema = z.object({
  body : z.object({
    email: z
      .string({ error:"email is required"})
      .email('Invalid email address format'),
      password : z
        .string({error: "password is required"})
        .min(6, 'password must be at least 6 characters long')
  })
})

export const loginSchema = z.object({
  body : z.object({
    email : z
      .string({error : 'email is required'})
      .email('Invalid email address format'),
      password : z
      .string({error : 'password is required' })
  })
})

export type RegisterInput = z.infer<typeof registerSchema>;