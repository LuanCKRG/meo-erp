export type ActionResponse<T> =
	| {
			success: true
			message: string
			data: T
	  }
	| {
			success: false
			message: string
	  }
