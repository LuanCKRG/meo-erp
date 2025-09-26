import Image from "next/image"

import { AuthFormTabs } from "@/components/auth-form-tabs"
import { CarouselHome } from "@/components/carousel-home"

const HomePage = () => {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				{/* <div className="flex justify-center gap-2 md:justify-start">
					<a href="#" className="flex items-center gap-2 font-medium">
								Acme Inc.
							</a>
				</div> */}
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full">
						<Image src="/logo.png" alt="MEO Leasing" width={400} height={300} className="mx-auto" />
						<AuthFormTabs />
					</div>
				</div>
			</div>
			<CarouselHome />
		</div>
	)
}

export default HomePage
