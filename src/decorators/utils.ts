export const getReturnTypeFromInfo = info => {
  if (typeof info.returnType === "object") {
    return (
      info.returnType.name ||
      info.returnType.ofType?.ofType?.name ||
      info.returnType.ofType?.ofType?.ofType?.name ||
      info.returnType.ofType?.name
    )
  } else {
    return info.returnType
  }
}
