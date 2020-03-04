import {
  getAllProducts,
  getAllPhysicalProducts,
  getAllProductVariants,
  getAllReservations,
  AirtableData,
} from "../airtable/utils"
import { prisma, ProductVariant, Prisma } from "../prisma"
import {
  getCorrespondingAirtableProductVariant,
  getCorrespondingAirtablePhysicalProduct,
} from "./utils"
import { db } from "../server"
import { airtableToPrismaInventoryStatus, Identity } from "../utils"
import { xor } from "lodash"
import util from "util"
import { CodeStarNotifications } from "aws-sdk"

export async function checkProductsAlignment() {
  const allAirtableProductVariants = await getAllProductVariants()
  const allAirtablePhysicalProducts = await getAllPhysicalProducts()
  const allAirtableProducts = await getAllProducts()
  const allAirtableReservations = await getAllReservations()
  const allPrismaProductVariants = await db.query.productVariants(
    {},
    `{
          id
          product {
              slug
          }
          physicalProducts {
              seasonsUID
              inventoryStatus
          }
          size
          sku
          total
          reservable
          reserved
          nonReservable
          createdAt
      }`
  )
  const allPrismaPhysicalProducts = await prisma.physicalProducts()
  const allPrismaProducts = await prisma.products()
  const allPrismaReservations = await db.query.reservations(
    {},
    `
    {
        id
        reservationNumber
        products {
            seasonsUID
        }
        status
    }
    `
  )

  let errors = []

  /* Do we have any products on prisma but not airtable? Vice versa? */
  const allPrismaProductSlugs = allPrismaProducts.map(prod => prod.slug)
  const allAirtableProductSlugs = allAirtableProducts.map(
    prod => prod.fields.Slug
  )
  const productsInAirtableButNotPrisma = allAirtableProductSlugs.filter(
    slug => !allPrismaProductSlugs.includes(slug)
  )
  const productsInPrismaButNotAirtable = allPrismaProductSlugs.filter(
    slug => !allAirtableProductSlugs.includes(slug)
  )

  /* Do we have any physical products in airtable but not prisma? Vice versa */
  const allPrismaPhysicalProductSUIDs = allPrismaPhysicalProducts.map(
    physProd => physProd.seasonsUID
  )
  const allAirtablePhysicalProductSUIDs = allAirtablePhysicalProducts.map(
    physProd => physProd.fields.SUID.text
  )
  const physicalProductsInAirtableButNotPrisma = allAirtablePhysicalProductSUIDs.filter(
    suid => !allPrismaPhysicalProductSUIDs.includes(suid)
  )
  const physicalProductsInPrismaButNotAirtable = allPrismaPhysicalProductSUIDs.filter(
    suid => !allAirtablePhysicalProductSUIDs.includes(suid)
  )

  /* Do we have any product variants in airtable but not prisma? Vice versa? */
  const allPrismaProductVariantSKUs = allPrismaProductVariants.map(
    prodVar => prodVar.sku
  )
  const allAirtableProductVariantSKUs = allAirtableProductVariants.map(
    prodVar => prodVar.fields.SKU
  )
  const productVariantsInAirtableButNotPrisma = allAirtableProductVariantSKUs.filter(
    sku => !allPrismaProductVariantSKUs.includes(sku)
  )
  const productVariantsInPrismaButNotAirtable = allPrismaProductVariantSKUs.filter(
    sku => !allAirtableProductVariantSKUs.includes(sku)
  )

  /* Are the skus matching between product variants on prisma and airtable?
  (Only considers those product variants in both prisma and airtable)
  */
  const {
    productVariantSKUMismatches,
    errors: prismaAirtableSKUCheckErrors,
  } = getPrismaAirtableProductVariantSKUMismatches(
    allAirtableProducts,
    allAirtableProductVariants,
    allPrismaProductVariants,
    productVariantsInPrismaButNotAirtable
  )
  errors = [...errors, ...prismaAirtableSKUCheckErrors]

  /* Check SUIDs. Are they correct on prisma? Are the correct on airtable? */
  const { prismaSUIDToSKUMismatches, airtableSUIDToSKUMismatches } = checkSUIDs(
    allPrismaProductVariants,
    allAirtableProductVariants,
    allAirtablePhysicalProducts
  )

  /* Are the product variant counts matching between prisma and airtable? */
  const {
    countMisalignments,
    prismaTotalPhysicalProductMisalignment,
    airtableTotalPhysicalProductMisalignment,
  } = checkCounts(
    allAirtableProductVariants,
    allPrismaProductVariants,
    allAirtableProducts
  )
  const [
    prismaCountToStatusMisalignments,
    airtableCountToStatusMisalignments,
  ] = checkMisalignmentsBetweenProdVarCountsAndPhysProdStatuses(
    allPrismaProductVariants,
    allAirtableProductVariants,
    allAirtablePhysicalProducts
  )

  /* Are the physical product statuses matching between prisma and airtable? */
  const {
    mismatchingStatuses,
    physicalProductsOnPrismaButNotAirtable,
  } = checkPhysicalProductStatuses(
    allPrismaPhysicalProducts,
    allAirtablePhysicalProducts
  )

  /* Are the reservations aligned? */
  const {
    misalignedSUIDsOnReservations,
    misalignedStatusOnReservations,
    reservationsWithMoreThanThreeProducts,
    reservationsInAirtableButNotPrisma,
    reservationsInPrismaButNotAirtable,
  } = checkReservations(
    allPrismaReservations,
    allAirtableReservations,
    allAirtablePhysicalProducts
  )

  /* REPORT */
  console.log(`/*********** REPORT ***********/`)
  console.log(
    `--- PRODUCTS ON PRISMA BUT NOR AIRTABLE: ${productsInPrismaButNotAirtable.length}`
  )
  console.log(
    `--- PRODUCTS ON AIRTABLE BUT NOT PRISMA: ${productsInAirtableButNotPrisma.length}`
  )
  console.log(
    `DO PRODUCTS, PHYSICAL PRODUCTS, AND PRODUCT VARIANTS ALIGN IN NUMBER?`
  )
  console.log(
    `--- PHYSICAL PRODUCTS ON PRISMA BUT NOT AIRTABLE: ${physicalProductsInPrismaButNotAirtable.length}`
  )
  console.log(
    `--- PHYSICAL PRODUCTS ON AIRTABLE BUT NOT PRISMA: ${physicalProductsInAirtableButNotPrisma.length}`
  )
  console.log(
    `--- PRODUCT VARIANTS ON PRISMA BUT NOT AIRTABLE: ${productVariantsInPrismaButNotAirtable.length}`
  )
  console.log(
    `--- PRODUCT VARIANTS ON AIRTABLE BUT NOT PRISMA: ${productVariantsInAirtableButNotPrisma.length}`
  )
  console.log(``)
  console.log(`DO PRODUCT VARIANT SKUS MATCH ON PRISMA AND AIRTABLE?`)
  console.log(
    `-- MISMATCHED PRODUCT VARIANT SKUS BETWEEN PRISMA/AIRTABLE: ${productVariantSKUMismatches.length}`
  )
  console.log(``)
  console.log(`ARE SUIDS CORRECT ON PRISMA AND AIRTABLE?`)
  console.log(
    `-- MISMATCHED SUID/SKU COMBOS ON PRISMA: ${prismaSUIDToSKUMismatches.length}`
  )
  console.log(
    `-- MISMATCHED SUID/SKU COMBOS ON AIRTABLE: ${airtableSUIDToSKUMismatches.length}`
  )
  console.log(``)
  console.log(`ARE THE COUNTS THE SAME ON PRISMA AND AIRTABLE?`)
  console.log(`-- MISMATCHED COUNTS: ${countMisalignments.length}`)
  console.log(
    `-- PRISMA: NUMBER OF PRODUCT VARIANTS WITH INCORRECT NUMBER OF PHYSICAL PRODUCTS ATTACHED: ${prismaTotalPhysicalProductMisalignment.length}`
  )
  console.log(
    `-- AIRTABLE: NUMBER OF PRODUCT VARIANTS WITH INCORRECT NUMBER OF PHYSICAL PRODUCTS ATTACHED: ${airtableTotalPhysicalProductMisalignment.length}`
  )
  console.log(
    `-- PRISMA: NUMBER OF PRODUCT VARIANTS WITH A COUNT PROFILE THAT DOESN'T MATCH THE STATUSES OF THE ATTACHED PHYSICAL PRODUCTS: ${prismaCountToStatusMisalignments.length}`
  )
  console.log(
    `-- AIRTABLE: NUMBER OF PRODUCT VARIANTS WITH A COUNT PROFILE THAT DOESN'T MATCH THE STATUSES OF THE ATTACHED PHYSICAL PRODUCTS: ${airtableCountToStatusMisalignments.length}`
  )
  prismaCountToStatusMisalignments.forEach(async a => {
    const trueReserved = a.physicalProducts.filter(b => b.status === "Reserved")
      .length
    const trueReservable = a.physicalProducts.filter(
      b => b.status === "Reservable"
    ).length
    const trueNonReservable = a.physicalProducts.filter(
      b => b.status === "NonReservable"
    ).length
    const trueCounts = {
      reserved: trueReserved,
      reservable: trueReservable,
      nonReservable: trueNonReservable,
    }
    console.log(a.sku)
    console.log(trueCounts)
    console.log(
      await prisma.updateProductVariant({
        where: { sku: a.sku },
        data: trueCounts,
      })
    )
  })
  //   console.log("PRISMA MISMATCHES")
  //   prismaCountToStatusMisalignments.forEach(a =>
  //     console.log(util.inspect(a, { depth: null }))
  //   )
  //   prismaCountToStatusMisalignments.forEach(async a =>
  //     console.log(
  //       `sku: ${a.sku}. createdAt: ${new Date(a.createdAt)}. reservations: ${(
  //         await getProductVariantReservationHistory(prisma, a.sku)
  //       ).map(r => r.reservationNumber)}`
  //     )
  //   )
  //   console.log("AIRTABLE MISMATCHES")
  //   airtableCountToStatusMisalignments.forEach(a =>
  //     console.log(util.inspect(a, { depth: null }))
  //   )
  //   const prodVarsWithImpossibleCounts = allPrismaProductVariants
  //     .filter(a => a.total !== a.reserved + a.reservable + a.nonReservable)
  //     .map(a =>
  //       Identity({
  //         sku: a.sku,
  //         total: a.total,
  //         reserved: a.reserved,
  //         reservable: a.reservable,
  //         nonReservable: a.nonReservable,
  //       })
  //     )
  //   console.log(
  //     `-- PRISMA: NUMBER OF PRODUCT VARIANTS WITH TOTAL != RESERVED + RESERVABLE + NONRESERVABLE: ${prodVarsWithImpossibleCounts.length}`
  //   )
  //   console.log(prodVarsWithImpossibleCounts)
  console.log(``)
  console.log(`ARE THE PHYSICAL PRODUCT STATUSES ALIGNED?`)
  console.log(
    `---NUMBER OF PHYSICAL PRODUCTS WITH MISMATCHING INVENTORY STATUSES: ${mismatchingStatuses.length}`
  )
  console.log(`ARE THE RESERVATIONS ALIGNED?`)
  console.log(
    `-- RESERVATIONS IN PRISMA BUT NOT AIRTABLE; ${reservationsInPrismaButNotAirtable.length}`
  )
  console.log(
    `-- RESERVATIONS IN AIRTABLE BUT NOT PRISMA: ${reservationsInAirtableButNotPrisma.length}`
  )
  console.log(
    `-- RESERVATIONS WITH MISMATCHING PRODUCTS: ${misalignedSUIDsOnReservations.length}`
  )
  console.log(
    `-- RESERVATIONS WITH MISMATCHING STATUSES: ${misalignedStatusOnReservations.length}`
  )
  console.log(
    `-- RESERVATIONS WITH MORE THAN 3 PRODUCTS: ${reservationsWithMoreThanThreeProducts.length}`
  )

  console.log(`ERRORS: ${errors.length}`)

  return [
    productsInPrismaButNotAirtable,
    productsInAirtableButNotPrisma,
    physicalProductsInPrismaButNotAirtable,
    physicalProductsInAirtableButNotPrisma,
    productVariantsInPrismaButNotAirtable,
    productVariantsInAirtableButNotPrisma,
    productVariantSKUMismatches,
    prismaSUIDToSKUMismatches,
    airtableSUIDToSKUMismatches,
    countMisalignments,
    prismaTotalPhysicalProductMisalignment,
    airtableTotalPhysicalProductMisalignment,
    mismatchingStatuses,
    reservationsInPrismaButNotAirtable,
    reservationsInAirtableButNotPrisma,
    misalignedSUIDsOnReservations,
    misalignedStatusOnReservations,
    reservationsWithMoreThanThreeProducts,
    errors,
  ]
}

checkProductsAlignment()

// *****************************************************************************
function getPrismaAirtableProductVariantSKUMismatches(
  allAirtableProducts,
  allAirtableProductVariants,
  allPrismaProductVariants,
  productVariantsInPrismaButNotAirtable
) {
  const productVariantSKUMismatches = []
  const errors = []
  for (const prismaProductVariant of allPrismaProductVariants) {
    try {
      // If its not in airtable, skip it
      if (
        productVariantsInPrismaButNotAirtable.includes(prismaProductVariant.sku)
      ) {
        continue
      }

      // Check if the skus match
      const correspondingAirtableProductVariant = getCorrespondingAirtableProductVariant(
        allAirtableProducts,
        allAirtableProductVariants,
        prismaProductVariant
      )
      if (
        prismaProductVariant.sku !==
        correspondingAirtableProductVariant.fields.SKU
      ) {
        productVariantSKUMismatches.push({
          prismaID: prismaProductVariant.id,
          prismaSKU: prismaProductVariant.sku,
          airtableRecordID: correspondingAirtableProductVariant.id,
          airtableSKU: correspondingAirtableProductVariant.fields.SKU,
        })
      }
    } catch (err) {
      console.log(err)
      errors.push(err)
      continue
    }
  }
  return { productVariantSKUMismatches, errors }
}

function checkSUIDs(
  allPrismaProductVariants,
  allAirtableProductVariants,
  allAirtablePhysicalProducts
) {
  const prismaSUIDToSKUMismatches = []
  for (const prismaProductVariant of allPrismaProductVariants) {
    for (const physProd of prismaProductVariant.physicalProducts) {
      if (!physProd.seasonsUID.startsWith(prismaProductVariant.sku)) {
        prismaSUIDToSKUMismatches.push({
          productVariantSKU: prismaProductVariant.sku,
          physicalProductSUID: physProd.seasonsUID,
        })
      }
    }
  }
  const airtableSUIDToSKUMismatches = []
  for (const airtableProductVariant of allAirtableProductVariants) {
    // If it has no physical products, skip it.
    if (!airtableProductVariant.fields["Physical Products"]) {
      continue
    }

    for (const airtablePhysProdRecordID of airtableProductVariant.fields[
      "Physical Products"
    ]) {
      const airtablePhysProdRecord = allAirtablePhysicalProducts.find(
        rec => rec.id == airtablePhysProdRecordID
      )
      if (
        !airtablePhysProdRecord.fields.SUID.text.startsWith(
          airtableProductVariant.fields.SKU
        )
      ) {
        airtableSUIDToSKUMismatches.push({
          productVariantSKU: airtableProductVariant.fields.SKU,
          physicalProductSUID: airtablePhysProdRecord.fields.SUID.text,
        })
      }
    }
  }
  return { prismaSUIDToSKUMismatches, airtableSUIDToSKUMismatches }
}

function checkCounts(
  allAirtableProductVariants,
  allPrismaProductVariants,
  allAirtableProducts
) {
  const countMisalignments = []
  const prismaTotalPhysicalProductMisalignment = []
  const airtableTotalPhysicalProductMisalignment = []
  for (const prismaProductVariant of allPrismaProductVariants) {
    const correspondingAirtableProductVariant = getCorrespondingAirtableProductVariant(
      allAirtableProducts,
      allAirtableProductVariants,
      prismaProductVariant
    )

    // Are the total, reservable, reserved, and nonreservable counts identical?
    if (correspondingAirtableProductVariant === undefined) {
      console.log(
        "could not find product variant in airtable. sku: ",
        prismaProductVariant.sku
      )
      continue
    }
    const totalCorrect =
      prismaProductVariant.total ===
      correspondingAirtableProductVariant.fields["Total Count"]
    const reservableCorrect =
      prismaProductVariant.reservable ===
      correspondingAirtableProductVariant.fields["Reservable Count"]
    const reservedCorrect =
      prismaProductVariant.reserved ===
      correspondingAirtableProductVariant.fields["Reserved Count"]
    const nonReservableCorrect =
      prismaProductVariant.nonReservable ===
      correspondingAirtableProductVariant.fields["Non-Reservable Count"]
    if (
      !totalCorrect ||
      !reservableCorrect ||
      !reservedCorrect ||
      !nonReservableCorrect
    ) {
      countMisalignments.push({
        sku: prismaProductVariant.sku,
        prismaCounts: {
          total: prismaProductVariant.total,
          reserved: prismaProductVariant.reserved,
          reservable: prismaProductVariant.reservable,
          nonReservable: prismaProductVariant.nonReservable,
        },
        airtableCounts: {
          total: correspondingAirtableProductVariant.fields["Total Count"],
          reserved:
            correspondingAirtableProductVariant.fields["Reserved Count"],
          reservable:
            correspondingAirtableProductVariant.fields["Reservable Count"],
          nonReservable:
            correspondingAirtableProductVariant.fields["Non-Reservable Count"],
        },
      })
    }

    // Does prisma have the number of physical products it should? ibid, Airtable?
    if (
      prismaProductVariant.physicalProducts.length !==
      prismaProductVariant.total
    ) {
      prismaTotalPhysicalProductMisalignment.push({
        sku: prismaProductVariant.sku,
        totalCount: prismaProductVariant.total,
        attachedPhysicalProducts: prismaProductVariant.physicalProducts.length,
      })
    }
    const noPhysicalProductsAndMisalignment =
      !correspondingAirtableProductVariant.fields["Physical Products"] &&
      correspondingAirtableProductVariant.fields["Total Count"] !== 0
    const physicalProductsAndMisalignment =
      !!correspondingAirtableProductVariant.fields["Physical Products"] &&
      correspondingAirtableProductVariant.fields["Physical Products"].length !==
        correspondingAirtableProductVariant.fields["Total Count"]
    if (noPhysicalProductsAndMisalignment || physicalProductsAndMisalignment) {
      airtableTotalPhysicalProductMisalignment.push({
        sku: correspondingAirtableProductVariant.fields.SKU,
        totalCount: correspondingAirtableProductVariant.fields["Total Count"],
        attachedPhysicalProducts:
          correspondingAirtableProductVariant.fields["Total Count"].length,
      })
    }
  }
  return {
    countMisalignments,
    prismaTotalPhysicalProductMisalignment,
    airtableTotalPhysicalProductMisalignment,
  }
}

function checkPhysicalProductStatuses(
  allPrismaPhysicalProducts,
  allAirtablePhysicalProducts
) {
  const mismatchingStatuses = []
  const physicalProductsOnPrismaButNotAirtable = []
  for (const prismaPhysicalProduct of allPrismaPhysicalProducts) {
    const correspondingAirtablePhysicalProduct = getCorrespondingAirtablePhysicalProduct(
      allAirtablePhysicalProducts,
      prismaPhysicalProduct
    )
    if (!correspondingAirtablePhysicalProduct) {
      physicalProductsOnPrismaButNotAirtable.push(
        prismaPhysicalProduct.seasonsUID
      )
      continue
    } else {
      if (
        airtableToPrismaInventoryStatus(
          correspondingAirtablePhysicalProduct.fields["Inventory Status"]
        ) !== prismaPhysicalProduct.inventoryStatus
      ) {
        mismatchingStatuses.push({
          seasonsUID: prismaPhysicalProduct.seasonsUID,
          airtableInventoryStatus:
            correspondingAirtablePhysicalProduct.fields["Inventory Status"],
          prismaInventoryStatus: prismaPhysicalProduct.inventoryStatus,
        })
      }
    }
  }
  return { mismatchingStatuses, physicalProductsOnPrismaButNotAirtable }
}

function checkReservations(
  allPrismaReservations,
  allAirtableReservations,
  allAirtablePhysicalProducts
) {
  const misalignedSUIDsOnReservations = []
  const misalignedStatusOnReservations = []
  const reservationsWithMoreThanThreeProducts = []
  const allPrismaReservationNumbers = allPrismaReservations.map(
    resy => resy.reservationNumber
  )
  const allAirtableReservationNumbers = allAirtableReservations.map(
    resy => resy.fields.ID
  )
  const reservationsInPrismaButNotAirtable = allPrismaReservationNumbers.filter(
    prismaResyNumber =>
      !allAirtableReservationNumbers.includes(prismaResyNumber)
  )
  const reservationsInAirtableButNotPrisma = allAirtableReservationNumbers.filter(
    airtableResyNumber =>
      !allPrismaReservationNumbers.includes(airtableResyNumber)
  )
  for (const prismaResy of allPrismaReservations) {
    if (
      reservationsInPrismaButNotAirtable.includes(prismaResy.reservationNumber)
    ) {
      continue
    }

    const correspondingAirtableReservation = allAirtableReservations.find(
      airtableResy => airtableResy.fields.ID === prismaResy.reservationNumber
    )

    // Check SUID match
    const prismaPhysicalProductSUIDs = prismaResy.products.map(
      prod => prod.seasonsUID
    )
    const airtablePhysicalProductSUIDs = correspondingAirtableReservation.fields.Items.map(
      airtablePhysicalProductRecordID =>
        allAirtablePhysicalProducts.find(
          airtablePhysProd =>
            airtablePhysProd.id === airtablePhysicalProductRecordID
        )
    ).map(airtablePhysProdRecord => airtablePhysProdRecord.fields.SUID.text)
    if (
      xor(prismaPhysicalProductSUIDs, airtablePhysicalProductSUIDs).length !== 0
    ) {
      misalignedSUIDsOnReservations.push({
        reservationNumber: prismaResy.reservationNumber,
        airtableSUIDs: airtablePhysicalProductSUIDs,
        prismaSUIDs: prismaPhysicalProductSUIDs,
      })
    }

    // Check status match
    if (
      prismaResy.status !==
      correspondingAirtableReservation.fields.Status.replace(" ", "")
    ) {
      misalignedStatusOnReservations.push({
        reservationNumber: prismaResy.reservationNumber,
        prismaStatus: prismaResy.status,
        airtableStatus: correspondingAirtableReservation.fields.Status,
      })
    }

    // Check item count
    if (prismaPhysicalProductSUIDs.length > 3) {
      reservationsWithMoreThanThreeProducts.push({
        reservationNumber: prismaResy.reservationNumber,
      })
    }
  }
  return {
    misalignedSUIDsOnReservations,
    misalignedStatusOnReservations,
    reservationsWithMoreThanThreeProducts,
    reservationsInAirtableButNotPrisma,
    reservationsInPrismaButNotAirtable,
  }
}

const checkMisalignmentsBetweenProdVarCountsAndPhysProdStatuses = (
  allPrismaProductVariants: any[],
  allAirtableProductVariants: AirtableData,
  allAirtablePhysicalProducts: AirtableData
) => {
  const prismaMisalignments = allPrismaProductVariants
    .filter(a => {
      const physicalProductsWithStatusReserved = a.physicalProducts.filter(
        b => b.inventoryStatus === "Reserved"
      )
      const physicalProductsWithStatusReservable = a.physicalProducts.filter(
        b => b.inventoryStatus === "Reservable"
      )
      const physicalProductsWithStatusNonReservable = a.physicalProducts.filter(
        b => b.inventoryStatus === "NonReservable"
      )
      return (
        a.reservable !== physicalProductsWithStatusReservable.length ||
        a.reserved !== physicalProductsWithStatusReserved.length ||
        a.nonReservable !== physicalProductsWithStatusNonReservable.length
      )
    })
    .map(c =>
      Identity({
        sku: c.sku,
        createdAt: c.createdAt,
        counts: {
          total: c.total,
          reservable: c.reservable,
          reserved: c.reserved,
          nonReservable: c.nonReservable,
        },
        physicalProducts: c.physicalProducts.map(d =>
          Identity({
            suid: d.seasonsUID,
            status: d.inventoryStatus,
          })
        ),
      })
    )

  const airtableMisalignments = allAirtableProductVariants
    .filter(a => {
      const correspondingAirtablePhysicalProducts = getAttachedAirtablePhysicalProducts(
        allAirtablePhysicalProducts,
        a
      )
      const physicalProductsWithStatusReserved = correspondingAirtablePhysicalProducts.filter(
        c => c.fields["Inventory Status"] === "Reserved"
      )
      const physicalProductsWithStatusReservable = correspondingAirtablePhysicalProducts.filter(
        c => c.fields["Inventory Status"] === "Reservable"
      )
      const physicalProductsWithStatusNonReservable = correspondingAirtablePhysicalProducts.filter(
        c => c.fields["Inventory Status"] === "NonReservable"
      )
      return (
        !!a.fields.SKU &&
        (a.fields["Reservable Count"] !==
          physicalProductsWithStatusReservable.length ||
          a.fields["Reserved Count"] !==
            physicalProductsWithStatusReserved.length ||
          a.fields["Non-Reservable Count"] !==
            physicalProductsWithStatusNonReservable.length)
      )
    })
    .map(d =>
      Identity({
        sku: d.fields.SKU,
        counts: {
          total: d.fields["Total Count"],
          reservable: d.fields["Reservable Count"],
          reserved: d.fields["Reserved Count"],
          nonReservable: d.fields["Non-Reservable Count"],
        },
        physicalProducts: getAttachedAirtablePhysicalProducts(
          allAirtablePhysicalProducts,
          d
        ).map(e =>
          Identity({
            SUID: e.fields.SUID.text,
            status: e.fields["Inventory Status"],
          })
        ),
      })
    )
  return [prismaMisalignments, airtableMisalignments]
}

const getAttachedAirtablePhysicalProducts = (
  allAirtablePhysicalProducts,
  airtableProductVariant
) => {
  if (!airtableProductVariant.fields.SKU) return []

  return allAirtablePhysicalProducts.filter(a =>
    airtableProductVariant.fields["Physical Products"].includes(a.id)
  )
}

const getProductVariantReservationHistory = async (
  prisma: Prisma,
  prodVarSku
) => {
  return await prisma.reservations({
    where: { products_some: { seasonsUID_contains: prodVarSku } },
  })
}
