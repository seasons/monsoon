export const getReturnTypeFromInfo = info => {
  if (typeof info === "object") {
    return info.returnType.name || info.returnType.ofType?.ofType?.name
  } else {
    return info.returnType
  }
}