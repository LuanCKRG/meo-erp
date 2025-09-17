// src/actions/orders/upload-order-files.ts
"use server"

import type { EditSimulationData } from "@/components/forms/new-simulation/validation/new-simulation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ActionResponse } from "@/types/action-response"

const BUCKET_NAME = "docs_simulation"

type DocumentField = keyof Pick<
	EditSimulationData,
	| "rgCnhSocios"
	| "balancoDRE2022"
	| "balancoDRE2023"
	| "balancoDRE2024"
	| "relacaoFaturamento"
	| "comprovanteEndereco"
	| "irpfSocios"
	| "fotosOperacao"
	| "contaDeEnergia"
>

const documentFields: DocumentField[] = [
	"rgCnhSocios",
	"balancoDRE2022",
	"balancoDRE2023",
	"balancoDRE2024",
	"relacaoFaturamento",
	"comprovanteEndereco",
	"irpfSocios",
	"fotosOperacao",
	"contaDeEnergia"
]

// Updated to return the count of uploaded files
async function uploadOrderFiles(orderId: string, data: EditSimulationData): Promise<ActionResponse<{ paths: string[]; uploadedCount: number }>> {
	const supabase = createAdminClient()
	const uploadedPaths: string[] = []
	let uploadedCount = 0

	try {
		for (const field of documentFields) {
			const fileList = data[field]
			// Verifica se o FileList não é nulo/undefined e tem pelo menos um arquivo.
			if (fileList && fileList.length > 0) {
				const file = fileList[0]
				// Cria um nome de arquivo padronizado: orderId/fieldName
				const filePath = `${orderId}/${field}`

				const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
					contentType: "application/pdf", // Força o tipo como PDF
					upsert: true // Sobrescreve se já existir um arquivo com o mesmo nome
				})

				if (error) {
					// Se um upload falhar, tenta remover os que já foram enviados para manter a consistência
					for (const uploadedPath of uploadedPaths) {
						await supabase.storage.from(BUCKET_NAME).remove([uploadedPath])
					}
					console.error(`Erro ao fazer upload do arquivo ${field}:`, error)
					return { success: false, message: `Erro ao enviar o arquivo para ${field}.` }
				}
				uploadedPaths.push(filePath)
				uploadedCount++
			}
		}

		return {
			success: true,
			message: "Arquivos enviados com sucesso.",
			data: { paths: uploadedPaths, uploadedCount }
		}
	} catch (e) {
		console.error("Erro inesperado em uploadOrderFiles:", e)
		// Tenta remover os arquivos já enviados
		if (uploadedPaths.length > 0) {
			await supabase.storage.from(BUCKET_NAME).remove(uploadedPaths)
		}
		const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro desconhecido."
		return {
			success: false,
			message: `Ocorreu um erro inesperado no servidor: ${errorMessage}`
		}
	}
}

export default uploadOrderFiles
