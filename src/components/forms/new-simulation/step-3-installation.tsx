"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"

import { brazilianStates } from "@/lib/constants"
import { maskCep } from "@/lib/masks"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SimulationStep3() {
	const { control } = useFormContext()

	return (
		<div className="space-y-6">
			<h3 className="text-lg font-medium">Passo 3: Local de Instalação</h3>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<FormField
					control={control}
					name="cep"
					render={({ field }) => (
						<FormItem className="md:col-span-1">
							<FormLabel>CEP *</FormLabel>
							<FormControl>
								<Input placeholder="00000-000" {...field} onChange={(e) => field.onChange(maskCep(e.target.value))} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="street"
					render={({ field }) => (
						<FormItem className="md:col-span-2">
							<FormLabel>Rua *</FormLabel>
							<FormControl>
								<Input placeholder="Avenida Paulista" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<FormField
					control={control}
					name="number"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Número *</FormLabel>
							<FormControl>
								<Input placeholder="123" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="complement"
					render={({ field }) => (
						<FormItem className="md:col-span-2">
							<FormLabel>Complemento (Opcional)</FormLabel>
							<FormControl>
								<Input placeholder="Apto 101, Bloco B" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<FormField
					control={control}
					name="neighborhood"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Bairro *</FormLabel>
							<FormControl>
								<Input placeholder="Bela Vista" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="city"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Cidade *</FormLabel>
							<FormControl>
								<Input placeholder="São Paulo" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="state"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Estado *</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Selecione o estado" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{brazilianStates.map((state) => (
										<SelectItem key={state.value} value={state.value}>
											{state.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	)
}
