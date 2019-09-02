import { init } from "."

export async function graphql(event, context, callback) {
  const { server } = await init()
  server(event, context, callback)
}

export async function playground(event, context, callback) {
  const { playground } = await init()
  playground(event, context, callback)
}
