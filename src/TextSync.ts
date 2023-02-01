import { Env } from "./types";

export class TextSync {
  state: DurableObjectState
  env: Env
  text: string | undefined
  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
  }

  async fetch(request: Request) {
    if (request.method === 'GET') {
      // Wait for the sender before returning
      while (!this.text) {
        await sleep(100)
      }
      return new Response(this.text)

    }else if(request.method === 'POST') {
      const text = await request.text()
      this.text = text
      return new Response('The text was consumed!')
    }
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
