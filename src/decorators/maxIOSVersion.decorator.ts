import { ExecutionContext, createParamDecorator } from "@nestjs/common"
import { UserDeviceData } from "@prisma/client"

import { readClient } from "../prisma/prisma.service"

// TODO: This doesn't seem to be caching the value on the
// context. Let's circle back to fix that.
export const MaxIOSVersion = createParamDecorator(
  async (
    data,
    context: ExecutionContext
  ): Promise<Omit<UserDeviceData, "id">> => {
    const [obj, args, ctx, info] = context.getArgs()
    console.log(ctx.maxIOSVersion)
    if (!!ctx.maxIOSVersion) {
      return ctx.maxIOSVersion
    }

    const maxMajorVersion = (
      await readClient.userDeviceData.findFirst({
        orderBy: { iOSMajorVersion: "desc" },
      })
    ).iOSMajorVersion
    const maxMinorVersion = (
      await readClient.userDeviceData.findFirst({
        where: { iOSMajorVersion: maxMajorVersion },
        orderBy: { iOSMinorVersion: "desc" },
      })
    ).iOSMinorVersion
    const maxPatch = (
      await readClient.userDeviceData.findFirst({
        where: {
          iOSMajorVersion: maxMajorVersion,
          iOSMinorVersion: maxMinorVersion,
        },
        orderBy: { iOSPatch: "desc" },
      })
    ).iOSPatch
    const result = {
      iOSVersion: `${maxMajorVersion}.${maxMinorVersion}.${maxPatch}`,
      iOSMajorVersion: maxMajorVersion,
      iOSMinorVersion: maxMinorVersion,
      iOSPatch: maxPatch,
    }
    ctx.maxIOSVersion = result

    return result
  }
)
