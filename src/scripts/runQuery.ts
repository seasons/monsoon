import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const allPhysProds = await ps.binding.query.physicalProducts(
    { where: {} },
    `{
        id
        inventoryStatus
        warehouseLocation {
          id
          barcode
        }
    }`
  )
  for (const physProd of allPhysProds) {
    if (
      physProd.inventoryStatus === "Reserved" &&
      !!physProd.warehouseLocation
    ) {
      await ps.client.updatePhysicalProduct({
        where: { id: physProd.id },
        data: { warehouseLocation: { disconnect: true } },
      })
    }
  }
}

run()
