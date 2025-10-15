"use server"

import fontkit from "@pdf-lib/fontkit"
import { PDFDocument, type PDFFont, rgb } from "pdf-lib"

import { getSimulationById } from "@/actions/simulations"
import { MONTSERRAT_BASE64, /*MONTSERRAT_SEMIBOLD_BASE64,*/ PDF_TEMPLATE_SIMULATION_BASE64 } from "@/lib/constants"
import { formatCnpj } from "@/lib/formatters"
import { calculateInstallmentPayment, formatDate } from "@/lib/utils"
import type { ActionResponse } from "@/types/action-response"

function formatCurrency(value: number | null | undefined): string {
	if (value === null || value === undefined) return "R$ 0,00"
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(value)
}

function truncateTextByWidth(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
	let truncatedText = text
	let textWidth = font.widthOfTextAtSize(truncatedText, fontSize)

	// Se o texto já cabe, retorna o texto original
	if (textWidth <= maxWidth) {
		return text
	}

	// Vai removendo caracteres do final até caber na largura máxima
	while (textWidth > maxWidth && truncatedText.length > 0) {
		truncatedText = truncatedText.slice(0, -1)
		textWidth = font.widthOfTextAtSize(truncatedText, fontSize)
	}

	return truncatedText
}

function calculateDynamicFontSize({
	text,
	font,
	maxWidth,
	maxFontSize,
	minFontSize = 6
}: {
	text: string
	font: PDFFont
	maxWidth: number
	maxFontSize: number
	minFontSize: number
}) {
	let fontSize = maxFontSize
	while (fontSize >= minFontSize) {
		const textWidth = font.widthOfTextAtSize(text, fontSize)
		if (textWidth <= maxWidth) {
			return fontSize
		}
		fontSize -= 0.5
	}
	return minFontSize
}

async function generateSimulationPdf(simulationId: string): Promise<ActionResponse<{ pdfBase64: string }>> {
	if (!simulationId) {
		return { success: false, message: "ID do pedido não fornecido." }
	}

	try {
		// 1. Buscar os dados do pedido e do cliente
		const simulationDetails = await getSimulationById(simulationId)
		if (!simulationDetails.success || !simulationDetails.data) {
			return { success: false, message: simulationDetails.message || "Não foi possível encontrar o pedido." }
		}

		const {
			customer,
			equipment_value,
			labor_value,
			other_costs,
			service_fee_36,
			service_fee_48,
			service_fee_60,
			interest_rate_36,
			interest_rate_48,
			interest_rate_60
		} = simulationDetails.data

		// 2. Carregar o template PDF e a fonte do Base64
		const templateBytes = Buffer.from(PDF_TEMPLATE_SIMULATION_BASE64, "base64")
		const montserratFontBytes = Buffer.from(MONTSERRAT_BASE64, "base64")
		// const montserratSemiBoldFontBytes = Buffer.from(MONTSERRAT_SEMIBOLD_BASE64, "base64")

		const pdfDoc = await PDFDocument.load(templateBytes)

		// Registrar o fontkit
		pdfDoc.registerFontkit(fontkit)

		const montserratFont = await pdfDoc.embedFont(montserratFontBytes, { subset: true })
		// const montserratSemiBoldFont = await pdfDoc.embedFont(montserratSemiBoldFontBytes, { subset: true })
		const textColor = rgb(83 / 255, 86 / 255, 90 / 255) // Cor #53565A
		const fontSize = 10

		// 3. Obter dimensões da página
		const firstPage = pdfDoc.getPages()[0]
		const { height } = firstPage.getSize()
		const leftAlign = 138

		// ========================================
		// BLOCO DE PREPARAÇÃO: Cálculos e Formatações
		// ========================================

		// CNPJ formatado
		const formattedCnpj = formatCnpj(customer.cnpj)

		// Razão Social truncada
		const maxCompanyNameWidth = 164
		const companyNameFontSize = 12
		const truncatedCompanyName = truncateTextByWidth(customer.company_name, montserratFont, companyNameFontSize, maxCompanyNameWidth)

		// Data atual
		const currentDate = formatDate(new Date().toISOString())

		// Valor Solicitado
		const requestedValue = (equipment_value || 0) + (labor_value || 0) + (other_costs || 0)
		const formattedRequestedValue = formatCurrency(requestedValue)
		const formattedRequestedValueSize = calculateDynamicFontSize({
			font: montserratFont,
			text: formattedRequestedValue,
			maxWidth: 48,
			maxFontSize: 12,
			minFontSize: 6
		})

		// Taxas de Serviços
		const serviceFee = {
			36: service_fee_36 / 100,
			48: service_fee_48 / 100,
			60: service_fee_60 / 100
		}

		// Total Serviços
		const totalServices = {
			36: requestedValue * serviceFee[36],
			48: requestedValue * serviceFee[48],
			60: requestedValue * serviceFee[60]
		}

		// Parcelas
		const installmentsRates = {
			36: interest_rate_36 / 100,
			48: interest_rate_48 / 100,
			60: interest_rate_60 / 100
		}

		const installments = {
			36: calculateInstallmentPayment({ numberOfPeriods: 36, presentValue: totalServices["36"] + requestedValue, rate: installmentsRates["36"] }),
			48: calculateInstallmentPayment({ numberOfPeriods: 48, presentValue: totalServices["48"] + requestedValue, rate: installmentsRates["48"] }),
			60: calculateInstallmentPayment({ numberOfPeriods: 60, presentValue: totalServices["60"] + requestedValue, rate: installmentsRates["60"] })
		}

		// ========================================
		// BLOCO DE DESENHO: Adicionar textos ao PDF
		// ========================================

		// Data Atual
		firstPage.drawText(currentDate, {
			x: 511,
			y: height - 74,
			size: fontSize,
			color: textColor,
			font: montserratFont
		})

		// Razão Social ou Cliente
		firstPage.drawText(truncatedCompanyName, {
			x: leftAlign,
			y: height - 130,
			size: companyNameFontSize,
			color: textColor,
			font: montserratFont
		})

		// CNPJ
		firstPage.drawText(formattedCnpj, {
			x: leftAlign,
			y: height - 148,
			size: fontSize,
			color: textColor,
			font: montserratFont
		})

		// Valor Solicitado
		firstPage.drawText(formattedRequestedValue, {
			x: leftAlign,
			y: height - 184,
			size: fontSize,
			color: textColor,
			font: montserratFont
		})

		firstPage.drawText(formattedRequestedValue, {
			x: 282,
			y: height - 487,
			size: formattedRequestedValueSize,
			color: textColor,
			font: montserratFont
		})

		firstPage.drawText(formattedRequestedValue, {
			x: 282,
			y: height - 507,
			size: formattedRequestedValueSize,
			color: textColor,
			font: montserratFont
		})

		firstPage.drawText(formattedRequestedValue, {
			x: 282,
			y: height - 527,
			size: formattedRequestedValueSize,
			color: textColor,
			font: montserratFont
		})

		// Total Serviços
		firstPage.drawText(formatCurrency(totalServices["36"]), {
			x: 336,
			y: height - 487,
			size: calculateDynamicFontSize({
				font: montserratFont,
				text: formatCurrency(totalServices["36"]),
				maxWidth: 48,
				maxFontSize: 12,
				minFontSize: 6
			}),
			color: textColor,
			font: montserratFont
		})

		firstPage.drawText(formatCurrency(totalServices["48"]), {
			x: 336,
			y: height - 507,
			size: calculateDynamicFontSize({
				font: montserratFont,
				text: formatCurrency(totalServices["48"]),
				maxWidth: 48,
				maxFontSize: 12,
				minFontSize: 6
			}),
			color: textColor,
			font: montserratFont
		})

		firstPage.drawText(formatCurrency(totalServices["60"]), {
			x: 336,
			y: height - 527,
			size: calculateDynamicFontSize({
				font: montserratFont,
				text: formatCurrency(totalServices["60"]),
				maxWidth: 48,
				maxFontSize: 12,
				minFontSize: 6
			}),
			color: textColor,
			font: montserratFont
		})

		// Valor Financiado
		firstPage.drawText(formatCurrency(totalServices["36"] + requestedValue), {
			x: 390,
			y: height - 487,
			size: calculateDynamicFontSize({
				font: montserratFont,
				text: formatCurrency(totalServices["36"] + requestedValue),
				maxWidth: 48,
				maxFontSize: 12,
				minFontSize: 6
			}),
			color: textColor,
			font: montserratFont
		})

		firstPage.drawText(formatCurrency(totalServices["48"] + requestedValue), {
			x: 390,
			y: height - 507,
			size: calculateDynamicFontSize({
				font: montserratFont,
				text: formatCurrency(totalServices["48"] + requestedValue),
				maxWidth: 48,
				maxFontSize: 12,
				minFontSize: 6
			}),
			color: textColor,
			font: montserratFont
		})

		firstPage.drawText(formatCurrency(totalServices["60"] + requestedValue), {
			x: 390,
			y: height - 527,
			size: calculateDynamicFontSize({
				font: montserratFont,
				text: formatCurrency(totalServices["60"] + requestedValue),
				maxWidth: 48,
				maxFontSize: 12,
				minFontSize: 6
			}),
			color: textColor,
			font: montserratFont
		})

		// Parcelas
		firstPage.drawText(formatCurrency(installments["36"]), {
			x: 444,
			y: height - 487,
			size: calculateDynamicFontSize({
				font: montserratFont,
				text: formatCurrency(installments["36"]),
				maxWidth: 40,
				maxFontSize: 12,
				minFontSize: 6
			}),
			color: textColor,
			font: montserratFont
		})

		firstPage.drawText(formatCurrency(installments["48"]), {
			x: 444,
			y: height - 507,
			size: calculateDynamicFontSize({
				font: montserratFont,
				text: formatCurrency(installments["48"]),
				maxWidth: 40,
				maxFontSize: 12,
				minFontSize: 6
			}),
			color: textColor,
			font: montserratFont
		})

		firstPage.drawText(formatCurrency(installments["60"]), {
			x: 444,
			y: height - 527,
			size: calculateDynamicFontSize({
				font: montserratFont,
				text: formatCurrency(installments["60"]),
				maxWidth: 40,
				maxFontSize: 12,
				minFontSize: 6
			}),
			color: textColor,
			font: montserratFont
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
		console.error("Erro ao gerar PDF do pedido:", error)
		const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido."
		return {
			success: false,
			message: `Ocorreu um erro inesperado ao gerar o PDF: ${errorMessage}`
		}
	}
}

export default generateSimulationPdf
