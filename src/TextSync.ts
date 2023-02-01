import { Env } from "./types";

interface TextSyncPair {
  value: string
  consumed: boolean
}
interface TextSyncPairs {
  [key: string]: TextSyncPair
}

export class TextSync {
  state: DurableObjectState
  env: Env
  pairs: TextSyncPairs
  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
    this.pairs = {}
  }

  async fetch(request: Request) {
    if(request.method === 'POST') {
      const text = await request.text()
      this.pairs[request.url] = { value: text, consumed: false }
      return new Response('The text was consumed!')
    } else if (request.method === 'GET') {
      // Wait for the sender before returning
      while (!this.pairs[request.url]) {
        await sleep(100)
      }
      return new Response(this.pairs[request.url].value)
    }
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
