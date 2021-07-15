import "module-alias/register"

import { get } from "lodash"

const infoToSelect = infoString => {
  const components = infoString
    .split("\n")
    .map(a => a.replace(/ /g, "")) as string[]

  const select = {}
  let pathCrumbs = []

  const getObjectToUpdate = () => {
    const pathString = pathCrumbs.reduce((acc, curVal) => {
      return acc + (acc !== "" ? "." : "") + curVal + ".select"
    }, "")
    const objectToUpdate = pathString === "" ? select : get(select, pathString)
    return objectToUpdate
  }
  for (const c of components) {
    if (c === "{") {
      // noop
    } else if (c !== "{" && c.includes("{")) {
      const fieldName = c.replace("{", "")

      const objectToUpdate = getObjectToUpdate()
      objectToUpdate[fieldName] = { select: {} }

      pathCrumbs.push(fieldName)
    } else if (c === "}") {
      pathCrumbs.pop()
    } else {
      const objectToUpdate = getObjectToUpdate()
      objectToUpdate[c] = true
    }
  }
  //   console.log(components)
  console.dir(select, { depth: null })
}

const run = () => {
  let info = `{
    id
    externalId
    displayName
    selectedOptions {
      name
      value
    }
    brand {
      id
      name
    }
    title
    image {
      url
    }
  }` // Insert your info string
  infoToSelect(info)
}

run()
