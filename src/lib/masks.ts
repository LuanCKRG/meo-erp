function maskCnpj(value: string) {
	return value
		.replace(/\D/g, "")
		.replace(/(\d{2})(\d)/, "$1.$2")
		.replace(/(\d{3})(\d)/, "$1.$2")
		.replace(/(\d{3})(\d)/, "$1/$2")
		.replace(/(\d{4})(\d)/, "$1-$2")
		.replace(/(-\d{2})\d+?$/, "$1")
}

function maskPhone(value: string) {
	let v = value.replace(/\D/g, "")
	v = v.replace(/^(\d{2})(\d)/g, "($1) $2")
	if (v.length > 13) {
		v = v.replace(/(\d{5})(\d)/, "$1-$2")
	} else {
		v = v.replace(/(\d{4})(\d)/, "$1-$2")
	}
	return v.slice(0, 15)
}

function maskCep(value: string) {
	return value
		.replace(/\D/g, "")
		.replace(/(\d{5})(\d)/, "$1-$2")
		.replace(/(-\d{3})\d+?$/, "$1")
}

function maskCpf(value: string) {
	return value
		.replace(/\D/g, "")
		.replace(/(\d{3})(\d)/, "$1.$2")
		.replace(/(\d{3})(\d)/, "$1.$2")
		.replace(/(\d{3})(\d)/, "$1-$2")
		.replace(/(-\d{2})\d+?$/, "$1")
}

function maskDate(value: string) {
	return value
		.replace(/\D/g, "")
		.replace(/(\d{2})(\d)/, "$1/$2")
		.replace(/(\d{2})(\d)/, "$1/$2")
		.replace(/(\d{4})\d+?$/, "$1")
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
	minimumFractionDigits: 2
})

const numberFormatter = new Intl.NumberFormat("pt-BR", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
})

function formatAsCurrency(value: string) {
	const numberValue = parseFloat(value.replace(/\D/g, "")) / 100

	if (Number.isNaN(numberValue)) return ""

	return currencyFormatter.format(numberValue).replace("R$", "").trim()
}

const maskNumber = (value: string, maxLength: number = 9) => {
	let justDigits = value.replace(/\D/g, "")

	if (justDigits.length > maxLength) {
		justDigits = justDigits.slice(0, maxLength)
	}

	const numberValue = parseFloat(justDigits) / 100

	if (Number.isNaN(numberValue)) return ""

	return numberFormatter.format(numberValue)
}

export { maskCnpj, maskPhone, maskCep, maskCpf, maskDate, formatAsCurrency, maskNumber }
