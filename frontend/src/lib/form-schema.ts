import z from 'zod';

export const loginFormSchema = z.object({
  auth: z.string({message: "username or email required"}),
  password: z.string({message: "password required"}),
});

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const RegisterFormSchema = z.object({
  username: z.string({message: "username required"}),
  email: z.string({message: "email required"}).regex(emailRegex,"Enter valid email address"),
  password: z.string({message:"password required"}).min(6,"Min Length 6 required"),
  confirm: z.string({message:"enter password again"}),
}).refine((data) => data.password === data.confirm, {
  "message": "passwords doesn't match",
  path: ["confirm"],
});


export const serverFormSchema =  z.object({
  serverName: z.string({message: "name required"}),
});



export const channelFormSchema = z.object({
  channelName: z.string().min(1,{message: "name required"}),
  type: z.enum(['text','voice']),
  isPrivate: z.boolean(),
});


export const categoryFormSchema = z.object({
  categoryName: z.string({message: "name required"}),
  isPrivate: z.boolean()
});