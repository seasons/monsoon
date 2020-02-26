import {
  getAllProducts,
  getAllPhysicalProducts,
  getAllProductVariants,
  getAllReservations,
} from "../src/airtable/utils"
import { prisma } from "../src/prisma"
import {
  getCorrespondingAirtableProductVariant,
  getCorrespondingAirtablePhysicalProduct,
} from "./utils"
import { db } from "../src/server"
import { airtableToPrismaInventoryStatus } from "../src/utils"
import { xor } from "lodash"

async function checkProductsAlignment() {
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
          }
          size
          sku
          total
          reservable
          reserved
          nonReservable
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
  let {
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
  let { prismaSUIDToSKUMismatches, airtableSUIDToSKUMismatches } = checkSUIDs(
    allPrismaProductVariants,
    allAirtableProductVariants,
    allAirtablePhysicalProducts
  )

  /* Are the product variant counts matching between prisma and airtable? */
  let {
    countMisalignments,
    prismaTotalPhysicalProductMisalignment,
    airtableTotalPhysicalProductMisalignment,
  } = checkCounts(
    allAirtableProductVariants,
    allPrismaProductVariants,
    allAirtableProducts
  )

  /* Are the physical product statuses matching between prisma and airtable? */
  let {
    mismatchingStatuses,
    physicalProductsOnPrismaButNotAirtable,
  } = checkPhysicalProductStatuses(
    allPrismaPhysicalProducts,
    allAirtablePhysicalProducts
  )

  /* Are the reservations aligned? */
  let {
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
  for (let p of productVariantsInPrismaButNotAirtable) {
    console.log(p)
  }
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
  console.log(``)
  console.log(`ARE THE PHYSICAL PRODUCT STATUSES ALIGNED?`)
  console.log(
    `---NUMBER OF PHYSICAL PRODUCTS WITH MISMATCHING INVENTORY STATUSES: ${mismatchingStatuses.length}`
  )
  console.log(``)
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
}

checkProductsAlignment()

// *****************************************************************************
function getPrismaAirtableProductVariantSKUMismatches(
  allAirtableProducts,
  allAirtableProductVariants,
  allPrismaProductVariants,
  productVariantsInPrismaButNotAirtable
) {
  let productVariantSKUMismatches = []
  let errors = []
  for (let prismaProductVariant of allPrismaProductVariants) {
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
  let prismaSUIDToSKUMismatches = []
  for (let prismaProductVariant of allPrismaProductVariants) {
    for (let physProd of prismaProductVariant.physicalProducts) {
      if (!physProd.seasonsUID.startsWith(prismaProductVariant.sku)) {
        prismaSUIDToSKUMismatches.push({
          productVariantSKU: prismaProductVariant.sku,
          physicalProductSUID: physProd.seasonsUID,
        })
      }
    }
  }
  let airtableSUIDToSKUMismatches = []
  for (let airtableProductVariant of allAirtableProductVariants) {
    // If it has no physical products, skip it.
    if (!airtableProductVariant.fields["Physical Products"]) {
      continue
    }

    for (let airtablePhysProdRecordID of airtableProductVariant.fields[
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
  let countMisalignments = []
  let prismaTotalPhysicalProductMisalignment = []
  let airtableTotalPhysicalProductMisalignment = []
  for (let prismaProductVariant of allPrismaProductVariants) {
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
  let mismatchingStatuses = []
  let physicalProductsOnPrismaButNotAirtable = []
  for (let prismaPhysicalProduct of allPrismaPhysicalProducts) {
    let correspondingAirtablePhysicalProduct = getCorrespondingAirtablePhysicalProduct(
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
  let misalignedSUIDsOnReservations = []
  let misalignedStatusOnReservations = []
  let reservationsWithMoreThanThreeProducts = []
  let allPrismaReservationNumbers = allPrismaReservations.map(
    resy => resy.reservationNumber
  )
  let allAirtableReservationNumbers = allAirtableReservations.map(
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
  for (let prismaResy of allPrismaReservations) {
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
