import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const updatesCoats = async () => {
  const ps = new PrismaService()

  const coatID = "ck2ze9bnt0ptm0734pkjvjcic"

  const woolCoatsID = "ckolp6w4o006r0718ckh3p58k"
  const leatherCoatID = "ckolonphf00410718220poltf"
  const pufferCoatID = "ckolp1gnb006007189atkwtyi"

  await ps.client.updateCategory({
    where: { id: coatID },
    data: {
      children: {
        connect: [woolCoatsID, leatherCoatID, pufferCoatID].map(k => ({
          id: k,
        })),
      },
    },
  })
}

const updateTops = async () => {
  const ps = new PrismaService()

  const topsID = "ck2ze97b70pos0734s341dmm3"

  const tankTopsID = "ckolp7z69007407184goywyhk"

  await ps.client.updateCategory({
    where: { id: topsID },
    data: {
      children: {
        connect: [tankTopsID].map(k => ({
          id: k,
        })),
      },
    },
  })
}

updatesCoats()
updateTops()
