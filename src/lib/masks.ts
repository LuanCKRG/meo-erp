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

export { maskCnpj, maskPhone, maskCep, maskCpf, maskDate }
