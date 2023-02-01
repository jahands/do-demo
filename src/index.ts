import { Env } from "./types";

// Need to export all Durable Objects so the runtime can find it
export { TextSync } from "./TextSync";

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const url = new URL(request.url)
		if (!url.pathname || url.pathname.length < 6) {
			return new Response('path must be at least 5 characters', { status: 400 })
		}

		// Get a Durable Object stub for the given path
		// We could use anything here, but the path is convenient
		const id = env.TEXTSYNC.idFromName(url.pathname)
		const stub = env.TEXTSYNC.get(id)

		// Forward the request to the Durable Object (which is like a single-instance Worker)
		return stub.fetch(request)
	},
};
