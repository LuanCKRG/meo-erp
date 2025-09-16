"use server"

import fontkit from "@pdf-lib/fontkit"
import { PDFDocument, rgb } from "pdf-lib"

import { getSimulationById } from "@/actions/simulations"
import { MONTSERRAT_BASE64, MONTSERRAT_SEMIBOLD_BASE64, PDF_TEMPLATE_SIMULATION_BASE64 } from "@/lib/constants"
import { formatCnpj } from "@/lib/formatters"
import { formatDate, calculateInstallmentPayment } from "@/lib/utils"
import type { ActionResponse } from "@/types/action-response"

const formatCurrency = (value: number | null | undefined): string => {
	if (value === null || value === undefined) return "R$ 0,00"
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(value)
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

		const { customer, created_at, equipment_value, labor_value, other_costs, system_power, current_consumption } = simulationDetails.data

		// 2. Carregar o template PDF e a fonte do Base64
		const templateBytes = Buffer.from(PDF_TEMPLATE_SIMULATION_BASE64, "base64")
		const montserratFontBytes = Buffer.from(MONTSERRAT_BASE64, "base64")
		const montserratSemiBoldFontBytes = Buffer.from(MONTSERRAT_SEMIBOLD_BASE64, "base64")

		const pdfDoc = await PDFDocument.load(templateBytes)

		// Registrar o fontkit
		pdfDoc.registerFontkit(fontkit)

		const montserratFont = await pdfDoc.embedFont(montserratFontBytes, { subset: true })
		const montserratSemiBoldFont = await pdfDoc.embedFont(montserratSemiBoldFontBytes, { subset: true })
		const textColor = rgb(83 / 255, 86 / 255, 90 / 255) // Cor #53565A

		// 3. Adicionar dados ao PDF
		const firstPage = pdfDoc.getPages()[0]
		const { width, height } = firstPage.getSize()
		const rightMargin = 36
		const rightAlignX = 260 // Ponto de ancoragem para o alinhamento à direita

		// Adiciona o CNPJ
		const formattedCnpj = formatCnpj(customer.cnpj)
		const cnpjWidth = montserratFont.widthOfTextAtSize(formattedCnpj, 12)
		firstPage.drawText(formattedCnpj, {
			x: rightAlignX - cnpjWidth,
			y: height - 145,
			size: 12,
			color: textColor,
			font: montserratFont
		})

		// Lógica para ajustar dinamicamente o tamanho da fonte da Razão Social
		let companyNameFontSize = 12
		const maxCompanyNameWidth = 250 // Largura máxima permitida
		let companyNameWidth = montserratFont.widthOfTextAtSize(customer.company_name, companyNameFontSize)

		while (companyNameWidth > maxCompanyNameWidth && companyNameFontSize > 8) {
			companyNameFontSize -= 0.5
			companyNameWidth = montserratFont.widthOfTextAtSize(customer.company_name, companyNameFontSize)
		}

		// Adiciona a Razão Social com o tamanho da fonte ajustado
		firstPage.drawText(customer.company_name, {
			x: rightAlignX - companyNameWidth,
			y: height - 163,
			size: companyNameFontSize,
			color: textColor,
			font: montserratFont
		})

		// Lógica para ajustar dinamicamente o tamanho da fonte de Cidade/UF
		const cidadeUf = `${customer.city}/${customer.state}`
		const maxCidadeUfWidth = 250
		let cidadeUfFontSize = 12
		let cidadeUfWidth = montserratFont.widthOfTextAtSize(cidadeUf, cidadeUfFontSize)

		while (cidadeUfWidth > maxCidadeUfWidth && cidadeUfFontSize > 8) {
			cidadeUfFontSize -= 0.5
			cidadeUfWidth = montserratFont.widthOfTextAtSize(cidadeUf, cidadeUfFontSize)
		}

		// Adiciona Cidade/Estado com fonte ajustada
		firstPage.drawText(cidadeUf, {
			x: rightAlignX - cidadeUfWidth,
			y: height - 180,
			size: cidadeUfFontSize,
			color: textColor,
			font: montserratFont
		})

		// Adiciona a Data de Criação do Pedido
		const creationDate = formatDate(created_at)
		const creationDateWidth = montserratFont.widthOfTextAtSize(creationDate, 12)
		firstPage.drawText(creationDate, {
			x: rightAlignX - creationDateWidth,
			y: height - 197,
			size: 12,
			color: textColor,
			font: montserratFont
		})

		// Adiciona a Data Atual (alinhado à direita)
		const currentDate = formatDate(new Date().toISOString())
		const currentDateWidth = montserratFont.widthOfTextAtSize(currentDate, 12)
		firstPage.drawText(currentDate, {
			x: width - 96,
			y: height - 76,
			size: 12,
			color: textColor,
			font: montserratFont
		})

		// Adiciona a Potência do Sistema (alinhado à direita)
		const formattedPower = `${system_power} kWp`
		const powerWidth = montserratFont.widthOfTextAtSize(formattedPower, 12)
		firstPage.drawText(formattedPower, {
			x: width - rightMargin - powerWidth,
			y: height - 145,
			size: 12,
			color: textColor,
			font: montserratFont
		})

		// Adiciona o Consumo Atual (alinhado à direita)
		const formattedConsumption = `${current_consumption} kWh`
		const consumptionWidth = montserratFont.widthOfTextAtSize(formattedConsumption, 12)
		firstPage.drawText(formattedConsumption, {
			x: width - rightMargin - consumptionWidth,
			y: height - 161,
			size: 12,
			color: textColor,
			font: montserratFont
		})

		// Calcula e adiciona o Valor Total do Investimento
		const subtotal = (equipment_value || 0) + (labor_value || 0) + (other_costs || 0)
		const totalInvestment = subtotal * 1.35
		const formattedTotalInvestment = formatCurrency(totalInvestment)
		const totalValueWidth = montserratSemiBoldFont.widthOfTextAtSize(formattedTotalInvestment, 12)
		firstPage.drawText(formattedTotalInvestment, {
			x: width - rightMargin - totalValueWidth,
			y: height - 197,
			size: 12,
			color: textColor,
			font: montserratSemiBoldFont
		})

		// Adiciona o total com a taxa nos outros locais
		firstPage.drawText(formattedTotalInvestment, {
			x: 175,
			y: height - 312,
			size: 12,
			color: textColor,
			font: montserratSemiBoldFont
		})

		firstPage.drawText(formattedTotalInvestment, {
			x: 175,
			y: height - 338,
			size: 12,
			color: textColor,
			font: montserratSemiBoldFont
		})

		firstPage.drawText(formattedTotalInvestment, {
			x: 175,
			y: height - 364,
			size: 12,
			color: textColor,
			font: montserratSemiBoldFont
		})

		// Calcula e adiciona as parcelas e o fator de leasing
		const interestRate = 0.021
		const terms = [36, 48, 60]
		const yPositions = [height - 312, height - 338, height - 364]
		const installmentX = 342
		const factorX = 265

		terms.forEach((term, index) => {
			const installment = calculateInstallmentPayment({
				rate: interestRate,
				numberOfPeriods: term,
				presentValue: totalInvestment
			})

			const factor = totalInvestment > 0 ? (installment / totalInvestment).toFixed(5) : "N/A"
			const formattedFactor = factor.toString().replace(".", ",")

			firstPage.drawText(formatCurrency(installment), {
				x: installmentX,
				y: yPositions[index],
				size: 12,
				color: textColor,
				font: montserratSemiBoldFont
			})

			firstPage.drawText(formattedFactor, {
				x: factorX,
				y: yPositions[index],
				size: 12,
				color: textColor,
				font: montserratFont
			})
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
