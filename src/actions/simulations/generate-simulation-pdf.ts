"use server"

import fs from "node:fs/promises"
import path from "node:path"
import { PDFDocument, rgb } from "pdf-lib"

import { getSimulationById } from "@/actions/simulations"
import { formatCnpj } from "@/lib/formatters"
import { formatDate } from "@/lib/utils"
import type { ActionResponse } from "@/types/action-response"

async function generateSimulationPdf(simulationId: string): Promise<ActionResponse<{ pdfBase64: string }>> {
	if (!simulationId) {
		return { success: false, message: "ID da simulação não fornecido." }
	}

	try {
		// 1. Buscar os dados da simulação e do cliente
		const simulationDetails = await getSimulationById(simulationId)
		if (!simulationDetails.success || !simulationDetails.data) {
			return { success: false, message: simulationDetails.message || "Não foi possível encontrar a simulação." }
		}

		const { customer, created_at } = simulationDetails.data

		// 2. Carregar o template PDF
		const templatePath = path.join(process.cwd(), "public", "template-simulation.pdf")
		const templateBytes = await fs.readFile(templatePath)
		const pdfDoc = await PDFDocument.load(templateBytes)

		// 3. Adicionar dados ao PDF
		const firstPage = pdfDoc.getPages()[0]
		const { width, height } = firstPage.getSize()
		const textColor = rgb(0.2, 0.2, 0.2) // Cor cinza escuro

		// Adiciona o CNPJ
		firstPage.drawText(formatCnpj(customer.cnpj), {
			x: 100,
			y: height - 150,
			size: 12,
			color: textColor
		})

		// Adiciona a Razão Social
		firstPage.drawText(customer.company_name, {
			x: 100,
			y: height - 168,
			size: 12,
			color: textColor
		})

		// Adiciona Cidade/Estado
		firstPage.drawText(`${customer.city}/${customer.state}`, {
			x: 100,
			y: height - 185,
			size: 12,
			color: textColor
		})

		// Adiciona a Data de Criação da Simulação
		const creationDate = formatDate(created_at)
		firstPage.drawText(creationDate, {
			x: 115,
			y: height - 201,
			size: 12,
			color: textColor
		})

		// Adiciona a Data Atual
		const currentDate = formatDate(new Date().toISOString())
		firstPage.drawText(currentDate, {
			x: width - 72,
			y: height - 85,
			size: 12,
			color: textColor
		})

		// 4. Salvar o PDF em memória e converter para Base64
		const pdfBytes = await pdfDoc.save()
		const pdfBase64 = Buffer.from(pdfBytes).toString("base64")

		return {
			success: true,
			message: "PDF gerado com sucesso.",
			data: { pdfBase64 }
		}
	} catch (error) {
		console.error("Erro ao gerar PDF:", error)
		const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido."
		return {
			success: false,
			message: `Ocorreu um erro inesperado ao gerar o PDF: ${errorMessage}`
		}
	}
}

export default generateSimulationPdf
