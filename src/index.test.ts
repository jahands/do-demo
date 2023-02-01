import { unstable_dev } from "wrangler"
import type { UnstableDevWorker } from "wrangler"
import { describe, expect, it, beforeAll, afterAll } from "vitest"

describe("Worker", () => {
	let worker: UnstableDevWorker

	beforeAll(async () => {
		worker = await unstable_dev("src/index.ts", {
			experimental: { disableExperimentalWarning: true },
		});
	});

	afterAll(async () => {
		await worker.stop()
	})

	it("should deny request for short paths", async () => {
		const cases = {
			failures: ["/", "/foo", "/foo/", "/%2F"],
		}
		for (const path of cases.failures) {
			const resp = await worker.fetch(`http://example.com${path}`)
			if (resp) {
				const text = await resp.text()
				expect(text).toMatchInlineSnapshot('"path must be at least 5 characters"')
			}
		}
	})

	describe("durable object", () => {
		it("Should send text from a POST to a matching GET", async () => {
			const path = "/stuff1"
			const url = `http://example.com${path}`
			
			// The get request should wait for the post request to complete
			const getResponsePromise = worker.fetch(url)

			// The post request to the same path should receive a response that the text was consumed
			const postResponse = await worker.fetch(url, { method: "POST", body: "Hello World 12345" })
			expect(postResponse.status).toBe(200)
			const postText = await postResponse.text()
			expect(postText).toBe("The text was consumed!")

			// The get request should now receive the text
			const getResponse = await getResponsePromise
			expect(getResponse.status).toBe(200)
			const text = await getResponse.text()
			expect(text).toBe("Hello World 12345")
		})
	})
})
