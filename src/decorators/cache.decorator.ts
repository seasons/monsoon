import { ExecutionContext, createParamDecorator } from "@nestjs/common"

// caches the result of the decorated function for <span> milliseconds
export function cache(span: number) {
  let cachedValue
  return async function (target) {
    if (!cachedValue) {
      cachedValue = await target()
      setTimeout(a => {
        cachedValue = null
      }, span)
    }
    return cachedValue
  }
}
