import "module-alias/register"

import { Prisma } from "@prisma/client"
import { flatten, merge } from "lodash"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const missing = []

  const rpps = await ps.client.reservationPhysicalProduct.findMany({
    select: {
      id: true,
      status: true,
      customer: {
        select: {
          id: true,
        },
      },
      physicalProduct: {
        select: {
          id: true,
          productVariant: {
            select: {
              id: true,
            },
          },
        },
      },
      bagItem: {
        select: {
          id: true,
          saved: true,
          position: true,
        },
      },
    },
  })

  for (const rpp of rpps) {
    if (
      !rpp?.bagItem?.id &&
      rpp.status !== "Cancelled" &&
      rpp.status !== "ReturnProcessed" &&
      rpp.status !== "Lost" &&
      rpp.status !== "Purchased"
    ) {
      console.log("missing: ", rpp.id, " / ", rpp.status)
      missing.push(rpp.id)

      const existingBagItems = await ps.client.bagItem.findMany({
        where: {
          customer: {
            id: rpp.customer.id,
          },
          physicalProduct: {
            id: rpp.physicalProduct.id,
          },
        },
      })

      if (!existingBagItems.length) {
        console.log("creating new")
        await ps.client.bagItem.create({
          data: {
            status: "Reserved",
            position: 0,
            saved: false,
            isInCart: false,
            physicalProduct: {
              connect: {
                id: rpp.physicalProduct.id,
              },
            },
            productVariant: {
              connect: {
                id: rpp.physicalProduct.productVariant.id,
              },
            },
            customer: {
              connect: {
                id: rpp.customer.id,
              },
            },
            reservationPhysicalProduct: {
              connect: {
                id: rpp.id,
              },
            },
          },
        })
      } else {
        console.log("existing", existingBagItems[0].id)
      }
    }
  }

  console.log("Missing: ", missing.length)
}

run()

// FIXED:
// missing:  ckxa45j6a00k91jxca2c9fw51  /  Packed
// missing:  ckx9cc597001w1jw3b2fz0lam  /  AtHome
// missing:  ckx0tuia500ix1jud9jw8dwng  /  Packed
// missing:  ckx0trd3g00e51jtrh7qeedcv  /  AtHome
// missing:  ckwzamqdt00071jy75jym634u  /  AtHome
// missing:  ckwy4pxaq64651bnjz5wlsu3w0  /  AtHome
// missing:  ckwy4nfaf50386bnjzt3mfgz32  /  InTransitInbound
// missing:  ckwy4pbmz61274bnjz0von1jna  /  AtHome
// missing:  ckwy4p06359433bnjztg9zp0co  /  AtHome
// missing:  ckwy4mvf747267bnjzr1ha940i  /  Picked
// missing:  ckwy4mlzi45695bnjz902q5wg5  /  AtHome
// missing:  ckwy4mltf45663bnjzpkdfhg3w  /  AtHome
// missing:  ckwy4mlnb45631bnjzfakiocnj  /  AtHome
// missing:  ckwy4lcre38314bnjzaa8k2xrm  /  ReturnPending
// missing:  ckwy4nyem53341bnjzex7wxv2v  /  DeliveredToBusiness
// missing:  ckwy4fx8f7433bnjz7eqgulom  /  AtHome
// missing:  ckwy4elgt0180bnjzgmfopmyb  /  DeliveredToBusiness
// missing:  ckwy4inyg22970bnjzybjmb2jg  /  AtHome
// missing:  ckwy4en010337bnjzbae4uqik  /  DeliveredToBusiness
// missing:  ckwy4n9rd49607bnjzils6gvaq  /  DeliveredToBusiness
// missing:  ckwy4f1632436bnjz1budarkl  /  DeliveredToBusiness
// missing:  ckwy4fh3k4978bnjzf4htwn46  /  AtHome
// missing:  ckwy4lzt442154bnjztnnrj9bc  /  DeliveredToBusiness
// missing:  ckwy4hkgm16762bnjz5t9r2917  /  DeliveredToBusiness
// missing:  ckwy4l6o637293bnjzd428cdgv  /  AtHome
// missing:  ckwy4n9ly49580bnjzhgtjhdy4  /  DeliveredToBusiness
// missing:  ckwy4lxy241833bnjzicf44n0z  /  DeliveredToBusiness
// missing:  ckwy4nz1153395bnjzw04t3w2f  /  DeliveredToBusiness
// missing:  ckwy4lzcq42072bnjzesuzd5sx  /  DeliveredToBusiness
// missing:  ckwy4m34u42706bnjzrlqijq7c  /  DeliveredToBusiness
// missing:  ckwy4m1zz42494bnjzqhfxum72  /  DeliveredToBusiness
// missing:  ckwy4m25e42522bnjzmx0waffz  /  DeliveredToBusiness
// missing:  ckwy4m3ab42733bnjz6zdpq78w  /  DeliveredToBusiness
// missing:  ckwy4m2av42550bnjzioul8r8s  /  DeliveredToBusiness
// missing:  ckwy4fctq4309bnjz460ju922  /  AtHome
// missing:  ckwy4fcnj4276bnjz70lz70pk  /  AtHome
// missing:  ckwy4ltqy41109bnjzgpakaj1d  /  DeliveredToBusiness
// missing:  ckwy4lu1u41136bnjze34yt6j8  /  DeliveredToBusiness
// missing:  ckwy4i1dl19359bnjzp4630i94  /  AtHome
// missing:  ckwy4hkbi16737bnjz9ypl2hbe  /  DeliveredToBusiness
// missing:  ckwy4gqfu12108bnjz08p9fwzx  /  DeliveredToBusiness
// missing:  ckwy4okji56802bnjzl2cqgv93  /  DeliveredToBusiness
// missing:  ckwy4p9ly60931bnjza6v5wtr6  /  AtHome
// missing:  ckwy4grjm12246bnjz56pme3ri  /  DeliveredToBusiness
// missing:  ckwy4gred12221bnjzqpm9oapu  /  DeliveredToBusiness
// missing:  ckwy4ojym56754bnjzw0vabhbs  /  DeliveredToBusiness
// missing:  ckwy4fscj6758bnjzxxsjvxha  /  AtHome
// missing:  ckwy4m5qq43155bnjzfltsyvwb  /  AtHome
// missing:  ckwy4ilg822559bnjz23xps4r7  /  AtHome
