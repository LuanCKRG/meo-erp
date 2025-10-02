import { getCurrentUser } from "@/actions/auth"
import { BannerCarousel } from "@/components/banner-carousel"
import { getFirstAndLastName } from "@/lib/utils"

const DashboardPage = async () => {
	const userData = await getCurrentUser()

	return (
		<div className="">
			<h3 className="text-2xl">
				Bem-vindo, <span className="font-semibold">{getFirstAndLastName(userData.name)}</span>!
			</h3>
			<p className="mb-3 md:mb-6">
				Seja bem-vindo a <span className="font-semibold text-primary">MEO Leasing</span>. Confira as nossas novidades abaixo:
			</p>
			<BannerCarousel />
		</div>
	)
}

export default DashboardPage
