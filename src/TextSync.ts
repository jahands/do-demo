import { Env } from "./types";

export class TextSync {
  state: DurableObjectState
  env: Env
  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
  }

  async fetch(request: Request) {
    return new Response("Hello World, I'm a DO!")
  }
}
