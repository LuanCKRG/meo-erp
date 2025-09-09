// src/components/forms/new-simulation/step-5-documents.tsx
"use client"

import { ArrowLeft, Send } from "lucide-react"
import { useFormContext } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FileInput } from "@/components/ui/file-input"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface Step5Props {
	onSubmit: () => void
	onBack: () => void
}

export const documentFields = [
	{ name: "rgCnhSocios", label: "RG / CNH Sócios *" },
	{ name: "balancoDRE2022", label: "Balanço e DRE 2022 *" },
	{ name: "balancoDRE2023", label: "Balanço e DRE 2023 *" },
	{ name: "balancoDRE2024", label: "Balanço e DRE 2024 *" },
	{ name: "relacaoFaturamento", label: "Relação de Faturamento *" },
	{ name: "comprovanteEndereco", label: "Comprovante de Endereço *" },
	{ name: "irpfSocios", label: "IRPF dos Sócios *" },
	{ name: "fotosOperacao", label: "Fotos da Operação *" }
] as const

export function SimulationStep5({ onSubmit, onBack }: Step5Props) {
	const form = useFormContext()

	return (
		<form className="space-y-6">
			<h3 className="text-lg font-medium">Passo 5: Anexo de Documentos</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{documentFields.map((doc) => (
					<FormField
						key={doc.name}
						control={form.control}
						name={doc.name}
						render={({ field }) => (
							<FormItem>
								<FormLabel>{doc.label}</FormLabel>
								<FormControl>
									<FileInput value={field.value} onChange={field.onChange} onRemove={() => form.setValue(doc.name, undefined, { shouldValidate: true })} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}
			</div>

			<div className="flex justify-between pt-8">
				<Button type="button" variant="outline" onClick={onBack}>
					<ArrowLeft className="mr-2 h-4 w-4" /> Voltar
				</Button>
				<Button type="button" onClick={onSubmit} disabled={form.formState.isSubmitting}>
					<Send className="mr-2 h-4 w-4" />
					Enviar Simulação
				</Button>
			</div>
		</form>
	)
}
