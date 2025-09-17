// src/components/forms/new-simulation/step-5-documents.tsx
"use client"

import { ArrowLeft, Send } from "lucide-react"
import { useFormContext } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FileInput } from "@/components/ui/file-input"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { documentFields } from "@/lib/constants"

interface Step5Props {
	onSubmit: () => void
	onBack: () => void
}

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
					Salvar
				</Button>
			</div>
		</form>
	)
}
