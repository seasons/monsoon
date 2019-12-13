/**
  Pseudo code for SUIDs correction script
    1. pull all products from prisma sorted by createdAt ASC
    2. generate style code
        - for each brand get filtered subset array based on previous order
        - use index of product in filtered brand array as style code
    3. generate new SKUs for existing product variants based on new style code
    4. diff between old and new product variant SKUs
    5. generate new SUIDs based on new product variant SKUs
    6. diff between old SUIDs and new SUIDs
 */

import { prisma } from "../../src/prisma"
import { db } from "../../src/server"
import { sizeToSizeCode } from "../../src/utils"
import {
  getAllProducts,
  getAllProductVariants,
  getAllPhysicalProducts,
} from "../../src/airtable/utils"
import { base } from "../../src/airtable/config"
import { getCorrespondingAirtableProductVariant } from "../utils"

export const SUIDcorrection = async (
  scopeBrand?: mismatchedBrand,
  print?: boolean
) => {
  if (print == null) {
    print = false
  }
  // Get all the physical products from airtable
  const allPrismaProducts = await db.query.products(
    {
      orderBy: "createdAt_ASC",
    },
    `
    {
        id
        slug
        name
        brand {
            id
            name
            brandCode
        }
        color {
            name
            colorCode
        }
        variants {
            sku
            size
        }
        createdAt
    }
  `
  )
  const allBrands = await prisma.brands()
  let mismatchedSKUs = 0
  let productsNoVariants = 0
  let skusToChange = []
  let skuChangesMap = {}

  for (let brand of allBrands) {
    if (!!scopeBrand && brand.brandCode !== scopeBrand) {
      continue
    }
    const productsForBrand = allPrismaProducts.filter(
      a => a.brand.id === brand.id
    )
    console.log(productsForBrand.map(prod => prod.name))
    // console.log(productsForBrand)
    let i = 0

    for (let product of productsForBrand) {
      const brandCode = product.brand.brandCode
      const colorCode = product.color.colorCode
      const styleCode = (++i).toString().padStart(3, "0")
      if (print) {
        console.log(product.name, product.color.name)
      }

      for (let variant of product.variants) {
        const sizeCode = sizeToSizeCode(variant.size)
        const sku = `${brandCode}-${colorCode}-${sizeCode}-${styleCode}`
        if (sku !== variant.sku) {
          skusToChange.push(variant.sku)
          skuChangesMap[variant.sku] = sku
          mismatchedSKUs++
          if (print) {
            console.log(sku, " - ", variant.sku)
          }
        }
      }
    }
  }
  console.log("Number of mismatched SKUs: ", mismatchedSKUs)
  console.log({
    skusToChange,
    skuChangesMap,
  })
  return {
    skusToChange,
    skuChangesMap,
  }
  //   console.log("Number with no variants: ", productsNoVariants)
}

// SUIDcorrection("SCAI", false)

async function fakeFixBrand(brand: mismatchedBrand, printMap: boolean) {
  // Create JSON representation of the product variants table for all ACNE product variants, including their associated physical products.
  const { skusToChange, skuChangesMap } = await SUIDcorrection(brand, false)
  console.log("CHANGES TO MAKE:")
  console.log(skuChangesMap)
  const allProdVarsForBrand = await db.query.productVariants(
    { where: { sku_starts_with: brand } },
    `{
        sku
        physicalProducts {
            id
            seasonsUID
        }
    }`
  )
  let brandMap = {}
  for (let prodVar of allProdVarsForBrand) {
    brandMap[prodVar.sku] = []
    for (let physProd of prodVar.physicalProducts) {
      brandMap[prodVar.sku].push(physProd.seasonsUID)
    }
  }

  let step = 0
  console.log(`SNAPSHOT OF PRODUCT VARIANTS DB BEFORE OPERATIONS`)
  console.log(brandMap)

  for (let originSKU of skusToChange) {
    let destinationSKU = skuChangesMap[originSKU]
    console.log(`HANDLE product variant w/sku: ${originSKU}`)

    // Delete any associated physical products on the product variant with the destinationSKU
    const physicalProductsOnProductVariantWithDestinationSKU = await db.query.physicalProducts(
      { where: { productVariant: { sku: destinationSKU } } }
    )
    for (let physProd of physicalProductsOnProductVariantWithDestinationSKU) {
      console.log(`- DELETE physical product w/ SUID: ${physProd.seasonsUID}`)
      console.log(`- TODO: Update brandmap`)
    }
    if (physicalProductsOnProductVariantWithDestinationSKU.length === 0) {
      console.log(`- (No physical products to delete)`)
    }

    // Shift the sku on the product variant
    if (destinationSKU in brandMap) {
      console.log(`- DELETE product variant w/SKU: ${destinationSKU}`)
      console.log(`- SHIFT sku: ${originSKU} --> ${destinationSKU}`)
      delete brandMap[destinationSKU]
      brandMap[destinationSKU] = [...brandMap[originSKU]]
      delete brandMap[originSKU]
    } else {
      console.log(`- SHIFT sku: ${originSKU} --> ${destinationSKU}`)
      brandMap[destinationSKU] = [...brandMap[originSKU]]
      delete brandMap[originSKU]
    }
    if (!!printMap) {
      console.log(`MAP STEP ${++step}`)
      console.log(brandMap)
    }
  }

  console.log(`SNAPSHOT OF PRODUCT VARIANTS DB AFTER OPERATIONS`)
  console.log(brandMap)
}

async function fixBrand(brand: mismatchedBrand) {
  const allAirtableProducts = await getAllProducts()
  const allAirtableProductVariants = await getAllProductVariants()
  const { skusToChange, skuChangesMap } = await SUIDcorrection(brand, false)

  let count = 0
  //   console.log(`${JSON.stringify(skuChangesMap)}`)
  for (let originSKU of skusToChange) {
    let destinationSKU = skuChangesMap[originSKU]
    console.log(`Mapping ${originSKU} to ${destinationSKU}`)

    // Make sure we don't need to delete any physical products
    const physicalProductsOnProductVariantWithDestinationSKU = await db.query.physicalProducts(
      { where: { productVariant: { sku: destinationSKU } } }
    )
    if (physicalProductsOnProductVariantWithDestinationSKU.length !== 0) {
      throw new Error(
        "UNEXPECTED RESULT -- WE NEED TO DELETE A PHYSICAL PRODUCT!"
      )
    }

    // Shift the sku on the product variant in prisma
    let prodVarToBeDeleted = await prisma.productVariant({
      sku: destinationSKU,
    })
    if (!!prodVarToBeDeleted) {
      await prisma.deleteProductVariant({ sku: destinationSKU })
    }
    let prismaProductVariant = await prisma.updateProductVariant({
      where: { sku: originSKU },
      data: { sku: destinationSKU },
    })
    console.log(`-- prisma product variant: ${originSKU} --> ${destinationSKU}`)

    // If need be, shift the sku on airtable
    prismaProductVariant = await db.query.productVariants(
      { where: { id: prismaProductVariant.id } },
      //   { where: { id: "ck2zed4w60vll0734wv3wgay1" } },
      `{
            id
            sku
            size
            product {
                slug
            }
        }`
    )
    prismaProductVariant = prismaProductVariant[0]

    const correspondingAirtableProduct = allAirtableProducts.find(
      //@ts-ignore
      prod => prod.fields.Slug === prismaProductVariant.product.slug
    )
    const candidateProductVariants = allAirtableProductVariants.filter(
      prodVar =>
        correspondingAirtableProduct.fields["Product Variants"].includes(
          prodVar.id
        )
    )
    const correspondingAirtableProductVariant = candidateProductVariants.find(
      prodVar => prodVar.fields.Size === prismaProductVariant.size
    )
    if (
      correspondingAirtableProductVariant.fields.SKU !==
      prismaProductVariant.sku
    ) {
      base("Product Variants").update(correspondingAirtableProductVariant.id, {
        SKU: prismaProductVariant.sku,
      })
      console.log(
        `-- airtable product variant ${correspondingAirtableProductVariant.id}: ${correspondingAirtableProductVariant.fields.SKU} --> ${prismaProductVariant.sku}`
      )
    }

    // Check that the number of linked physical products are the same on prisma and airtable
    const prismaPhysicalProducts = await prisma.physicalProducts({
      where: { productVariant: { id: prismaProductVariant.id } },
      orderBy: "createdAt_ASC",
    })
    if (
      prismaPhysicalProducts.length !==
      correspondingAirtableProductVariant.fields["Physical Products"].length
    ) {
      throw new Error(
        `${prismaPhysicalProducts.length} physical products found on prisma.` +
          ` ${correspondingAirtableProductVariant.fields["Physical Products"].length}` +
          ` found on airtable. Prisma product variant id, sku: ${prismaProductVariant.id}, ${prismaProductVariant.sku}` +
          `. Airtable product variant record id: ${correspondingAirtableProductVariant.id}`
      )
    }

    // Fix the suid in prisma
    const newSUID = `${prismaProductVariant.sku}-01`
    if (prismaPhysicalProducts.length > 1) {
      throw new Error(
        `More than one physical product found for variant ${prismaProductVariant.sku}`
      )
    }
    let oldSUID
    if (prismaPhysicalProducts.length == 1) {
      oldSUID = await prisma
        .physicalProduct({
          id: prismaPhysicalProducts[0].id,
        })
        .seasonsUID()
      await prisma.updatePhysicalProduct({
        where: { id: prismaPhysicalProducts[0].id },
        data: {
          seasonsUID: newSUID,
        },
      })
      console.log(`-- prisma physical product: ${oldSUID} --> ${newSUID}`)
    }

    // Fix the suid in airtable
    if (
      correspondingAirtableProductVariant.fields["Physical Products"].length > 1
    ) {
      throw new Error(
        `More than one physical product linked to record on airtable. Airtable product variant record id ${correspondingAirtableProductVariant.id}`
      )
    }
    if (
      correspondingAirtableProductVariant.fields["Physical Products"].length ==
      1
    ) {
      base("Physical Products").update(
        correspondingAirtableProductVariant.fields["Physical Products"][0],
        { SUID: { text: newSUID } }
      )
      console.log(
        `-- airtable physical product ${correspondingAirtableProductVariant.fields["Physical Products"][0]} suid set to ${newSUID}`
      )
    }
  }
}

async function fixSUIDSKUMisalignments() {
  const allPrismaProductVariants = await db.query.productVariants(
    {},
    `
        {
            sku
            physicalProducts {
                seasonsUID
                id
            }
            product {
                slug
            }
            size
        }`
  )
  const allAirtableProductVariants = await getAllProductVariants()
  const allAirtablePhysicalProducts = await getAllPhysicalProducts()
  const allAirtableProducts = await getAllProducts()
  for (let prismaProductVariant of allPrismaProductVariants) {
    for (let physProd of prismaProductVariant.physicalProducts) {
      if (!physProd.seasonsUID.startsWith(prismaProductVariant.sku)) {
        // Don't deal with > 1 cases
        if (prismaProductVariant.physicalProducts.length > 1) {
          continue
        }

        // Update the SUID on prisma
        let newSUID = `${prismaProductVariant.sku}-01`
        await prisma.updatePhysicalProduct({
          data: { seasonsUID: newSUID },
          where: { id: physProd.id },
        })
        console.log(`PRISMA: ${physProd.seasonsUID} --> ${newSUID}`)

        // Update the SUID on airtable
        const correspondingAirtableProductVariant = getCorrespondingAirtableProductVariant(
          allAirtableProducts,
          allAirtableProductVariants,
          prismaProductVariant
        )
        const correspondingAirtablePhysicalProducts = allAirtablePhysicalProducts.filter(
          physProd =>
            correspondingAirtableProductVariant.fields[
              "Physical Products"
            ].includes(physProd.id)
        )
        if (correspondingAirtablePhysicalProducts.length != 1) {
          throw new Error(
            "More than 1 physical product on airtable. Unexpected!"
          )
        }
        base("Physical Products").update(
          correspondingAirtablePhysicalProducts[0].id,
          { SUID: { text: newSUID } }
        )
        console.log(
          `AIRTABLE: ${correspondingAirtablePhysicalProducts[0].fields.SUID.text} --> ${newSUID}`
        )
        console.log(``)
      }
    }
  }
}
// fixBrand("LEVI")
// all the mismatched brands

fixSUIDSKUMisalignments()

type mismatchedBrand =
  | "ACNE"
  | "CARH"
  | "CAVE"
  | "CDGS"
  | "PRDA"
  | "RHUD"
  | "SCAI"
  | "STIS"
  | "LEVI"
