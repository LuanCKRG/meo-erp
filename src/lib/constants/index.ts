import brazilianStates from "@/lib/constants/brazilian-states"
import connectionVoltageTypes from "@/lib/constants/connection-voltage-types"
import energyProviders from "@/lib/constants/energy-providers"
import { INVERTER_TYPE_ID, MODULE_TYPE_ID, OTHERS_TYPE_ID } from "@/lib/constants/equipment-types-ids"
import PERMISSIONS from "@/lib/constants/permissions"
import PDF_TEMPLATE_SIMULATION_BASE64 from "@/lib/constants/template-simulation-base44"

type PermissionId = (typeof PERMISSIONS)[number]

export {
	energyProviders,
	brazilianStates,
	connectionVoltageTypes,
	INVERTER_TYPE_ID,
	MODULE_TYPE_ID,
	OTHERS_TYPE_ID,
	PERMISSIONS,
	type PermissionId,
	PDF_TEMPLATE_SIMULATION_BASE64
}
