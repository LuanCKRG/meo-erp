import { z } from "zod"

const registerCustomerSchema = z
	.object({
		name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
		email: z.email("Por favor, insira um email válido."),
		password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem.",
		path: ["confirmPassword"]
	})

type RegisterCustomerData = z.infer<typeof registerCustomerSchema>

export { registerCustomerSchema }
export type { RegisterCustomerData }
