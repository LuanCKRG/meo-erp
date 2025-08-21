import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request
	})

	const supabaseUrl = process.env.SUPABASE_URL
	const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

	if (!supabaseUrl || !supabaseServiceRoleKey) {
		throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable")
	}

	const supabase = createServerClient(supabaseUrl, supabaseServiceRoleKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll()
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
				supabaseResponse = NextResponse.next({
					request
				})
				cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
			}
		}
	})

	// Do not run code between createServerClient and
	// supabase.auth.getUser(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// IMPORTANT: DO NOT REMOVE auth.getUser()

	const {
		data: { user }
	} = await supabase.auth.getUser()

	const pathname = request.nextUrl.pathname

	// rotas públicas (adapte conforme seus paths)
	const publicPaths = ["/", "/_next", "/favicon.ico", "/register-partner"]

	const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))

	if (user && pathname === "/") {
		const url = request.nextUrl.clone()
		url.pathname = "/dashboard/home"
		return NextResponse.redirect(url)
	}

	if (!user && !isPublic) {
		const url = request.nextUrl.clone()
		url.pathname = "/"
		return NextResponse.redirect(url)
	}

	// IMPORTANT: You *must* return the supabaseResponse object as it is.
	// If you're creating a new response object with NextResponse.next() make sure to:
	// 1. Pass the request in it, like so:
	//    const myNewResponse = NextResponse.next({ request })
	// 2. Copy over the cookies, like so:
	//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
	// 3. Change the myNewResponse object to fit your needs, but avoid changing
	//    the cookies!
	// 4. Finally:
	//    return myNewResponse
	// If this is not done, you may be causing the browser and server to go out
	// of sync and terminate the user's session prematurely!

	return supabaseResponse
}

export { updateSession }
