import approvePartner from "@/actions/partners/approve-partner"
import getAllPartners from "@/actions/partners/get-all-partners"
import getPartnerByCNPJ from "@/actions/partners/get-by-cnpj"
import registerPartner from "@/actions/partners/register-partner"
import rejectPartner from "@/actions/partners/reject-partner"
import setPartnerActiveStatus from "@/actions/partners/set-partner-active-status"
import updatePartner from "@/actions/partners/update-partner"
import getCurrentPartnerDetails from "@/actions/partners/get-current-partner-details"
import getPartnersBySellerId from "@/actions/partners/get-partner-by-seller-id"

export {
	getAllPartners,
	getPartnerByCNPJ,
	registerPartner,
	approvePartner,
	rejectPartner,
	updatePartner,
	setPartnerActiveStatus,
	getCurrentPartnerDetails,
	getPartnersBySellerId
}
