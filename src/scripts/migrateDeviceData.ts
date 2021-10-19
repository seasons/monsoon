import "module-alias/register"

import chargebee from "chargebee"

import { PrismaService } from "../prisma/prisma.service"

const ps = new PrismaService()

const run = async () => {
  const allDeviceData = await ps.client.userDeviceData.findMany()

  let i = 0
  for (const dd of allDeviceData) {
    console.log(`Update ${i++} of ${allDeviceData.length}`)
    const versionString = dd.iOSVersion
    const [major, minor, patch] = versionString.split(".")

    const data = {
      iOSVersion: versionString,
      iOSMajorVersion: Number(major),
      iOSMinorVersion: Number(minor),
      iOSPatch: patch ? Number(patch) : 0,
    }

    await ps.client.userDeviceData.update({ where: { id: dd.id }, data })
  }

  console.log("Updated all records")
}
run()
