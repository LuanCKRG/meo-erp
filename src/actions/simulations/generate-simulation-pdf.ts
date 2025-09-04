"use server"

import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

import { getSimulationById } from "@/actions/simulations"
import { formatCnpj } from "@/lib/formatters"
import { formatDate } from "@/lib/utils"
import type { ActionResponse } from "@/types/action-response"
import { PDF_TEMPLATE_SIMULATION_BASE64 } from "@/lib/constants"

const formatCurrency = (value: number | null | undefined): string => {
	if (value === null || value === undefined) return "R$ 0,00"
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(value)
}

const formatResidualValue = (value: number | null | undefined): string => {
	if (value === null || value === undefined) return "R$ 0"
	const options: Intl.NumberFormatOptions = {
		style: "currency",
		currency: "BRL"
	}
	// Se o número for inteiro, formata sem casas decimais.
	if (value % 1 === 0) {
		options.minimumFractionDigits = 0
		options.maximumFractionDigits = 0
	} else {
		// Se tiver decimais, formata com eles.
		options.minimumFractionDigits = 2
		options.maximumFractionDigits = 2
	}
	return new Intl.NumberFormat("pt-BR", options).format(value)
}

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

		const { customer, created_at, equipment_value, labor_value, other_costs, system_power } = simulationDetails.data

		// 2. Carregar o template PDF do Base64
		const templateBytes = Buffer.from(PDF_TEMPLATE_SIMULATION_BASE64, "base64")
		const pdfDoc = await PDFDocument.load(templateBytes)
		const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

		// 3. Adicionar dados ao PDF
		const firstPage = pdfDoc.getPages()[0]
		const { width, height } = firstPage.getSize()
		const textColor = rgb(0.2, 0.2, 0.2) // Cor cinza escuro

		// Adiciona o CNPJ
		firstPage.drawText(formatCnpj(customer.cnpj), {
			x: 100,
			y: height - 150,
			size: 12,
			color: textColor,
			font
		})

		// Lógica para ajustar dinamicamente o tamanho da fonte da Razão Social
		let companyNameFontSize = 12
		const maxCompanyNameWidth = 168 // Largura máxima permitida para a razão social
		let companyNameWidth = font.widthOfTextAtSize(customer.company_name, companyNameFontSize)

		while (companyNameWidth > maxCompanyNameWidth && companyNameFontSize > 8) {
			companyNameFontSize -= 0.5
			companyNameWidth = font.widthOfTextAtSize(customer.company_name, companyNameFontSize)
		}

		// Adiciona a Razão Social com o tamanho da fonte ajustado
		firstPage.drawText(customer.company_name, {
			x: 100,
			y: height - 168,
			size: companyNameFontSize,
			color: textColor,
			font
		})

		// Lógica para ajustar dinamicamente o tamanho da fonte de Cidade/UF
		const cidadeUf = `${customer.city}/${customer.state}`
		let cidadeUfFontSize = 12
		const maxCidadeUfWidth = 168
		let cidadeUfWidth = font.widthOfTextAtSize(cidadeUf, cidadeUfFontSize)

		while (cidadeUfWidth > maxCidadeUfWidth && cidadeUfFontSize > 8) {
			cidadeUfFontSize -= 0.5
			cidadeUfWidth = font.widthOfTextAtSize(cidadeUf, cidadeUfFontSize)
		}

		// Adiciona Cidade/Estado com fonte ajustada
		firstPage.drawText(cidadeUf, {
			x: 100,
			y: height - 185,
			size: cidadeUfFontSize,
			color: textColor,
			font
		})

		// Adiciona a Data de Criação da Simulação
		const creationDate = formatDate(created_at)
		firstPage.drawText(creationDate, {
			x: 115,
			y: height - 201,
			size: 12,
			color: textColor,
			font
		})

		// Adiciona a Data Atual
		const currentDate = formatDate(new Date().toISOString())
		firstPage.drawText(currentDate, {
			x: width - 72,
			y: height - 85,
			size: 12,
			color: textColor,
			font
		})

		// Adiciona a Potência do Sistema
		const formattedPower = `${system_power} kWp`
		firstPage.drawText(formattedPower, {
			x: width - 138,
			y: height - 152,
			size: 12,
			color: textColor,
			font
		})

		// Calcula e adiciona o Valor Residual
		const totalValue = (equipment_value || 0) + (labor_value || 0) + (other_costs || 0)
		const residual_value = totalValue * 0.1 // 10%
		const formattedResidualValue = formatResidualValue(residual_value)

		let residualValueFontSize = 12
		const maxResidualValueWidth = 53
		let residualValueWidth = font.widthOfTextAtSize(formattedResidualValue, residualValueFontSize)

		while (residualValueWidth > maxResidualValueWidth && residualValueFontSize > 8) {
			residualValueFontSize -= 0.5
			residualValueWidth = font.widthOfTextAtSize(formattedResidualValue, residualValueFontSize)
		}

		const residualValueY = height - 360
		const residualValueX = 150

		// Adiciona o valor residual formatado
		firstPage.drawText(formattedResidualValue, {
			x: residualValueX,
			y: residualValueY,
			size: residualValueFontSize,
			color: textColor,
			font
		})

		// Calcular e adicionar valores das parcelas
		const installment36 = totalValue / 36
		const installment48 = totalValue / 48
		const installment60 = totalValue / 60

		firstPage.drawText(formatCurrency(installment36), {
			x: 82,
			y: height - 330,
			size: 12,
			color: textColor,
			font
		})

		firstPage.drawText(formatCurrency(installment48), {
			x: 82,
			y: height - 362,
			size: 12,
			color: textColor,
			font
		})

		firstPage.drawText(formatCurrency(installment60), {
			x: 82,
			y: height - 390,
			size: 12,
			color: textColor,
			font
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
