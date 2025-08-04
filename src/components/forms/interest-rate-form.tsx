"use client"

import { Loader2, Save } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { maskNumber } from "@/lib/masks"

const InterestRateForm = () => {
	const [value, setValue] = useState("2,10")
	const [isPending, startTransition] = useTransition()

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const maskedValue = maskNumber(e.target.value, 4) // Limita a 4 dígitos (ex: 99,99)
		setValue(maskedValue)
	}

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		const numericValue = parseFloat(value.replace(".", "").replace(",", "."))
		if (Number.isNaN(numericValue) || numericValue < 0) {
			toast.error("Valor inválido", {
				description: "A taxa de juros não pode ser menor que zero."
			})
			return
		}

		startTransition(() => {
			// Simula uma chamada de API
			const promise = new Promise((resolve) => setTimeout(resolve, 1000))

			toast.promise(promise, {
				loading: "Salvando alterações...",
				success: () => {
					// Aqui você chamaria sua server action para salvar `numericValue`
					return "Taxa de juros salva com sucesso!"
				},
				error: "Ocorreu um erro ao salvar."
			})
		})
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
			<div className="space-y-2">
				<Label htmlFor="interest-rate">Taxa de Juros (%)</Label>
				<div className="relative">
					<Input id="interest-rate" type="text" inputMode="decimal" placeholder="2,10" value={value} onChange={handleChange} />
					<span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
				</div>
				<p className="text-xs text-muted-foreground">Use vírgula como separador decimal. Ex: 2,10 para 2,10%.</p>
			</div>
			<Button type="submit" className="self-start" disabled={isPending}>
				{isPending ? <Loader2 className="animate-spin" /> : <Save />}
				Salvar Alterações
			</Button>
		</form>
	)
}

export { InterestRateForm }
