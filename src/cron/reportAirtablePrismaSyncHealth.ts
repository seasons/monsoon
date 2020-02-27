import { WebClient } from "@slack/web-api"
import { Identity } from "../utils"
import { checkProductsAlignment } from "./airtableToPrismaHealthCheck"

export const run = async () => {
  const web = new WebClient(process.env.SLACK_CANARY_API_TOKEN)

  let message = { channel: process.env.SLACK_DEV_CHANNEL_ID, text: "'" }
  try {
    const [
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
    ] = await checkProductsAlignment()
    throw new Error("yo")
    message = {
      ...message,
      text: "",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:newspaper: *Airtable-Prisma Products Parity Health Check* :newspaper:`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `*${new Date().toLocaleDateString()}*`,
            },
          ],
        },
        ...createReportSection({
          title:
            "Do products, physical products, and product variants align in number?",
          datapoints: [
            {
              name: "Products on Prisma but not Airtable",
              number: productsInPrismaButNotAirtable.length,
              shouldFlagNum: true,
            },
            {
              name: "Products on Airtable but not Prisma",
              number: productsInAirtableButNotPrisma.length,
            },
            {
              name: "Physical Products on Prisma but not Airtable",
              number: physicalProductsInPrismaButNotAirtable.length,
              shouldFlagNum: true,
            },
            {
              name: "Physical Products on Airtable but not Prisma",
              number: physicalProductsInAirtableButNotPrisma.length,
            },
            {
              name: "Product Variants on Prisma but not Airtable",
              number: productVariantsInPrismaButNotAirtable.length,
              shouldFlagNum: true,
            },
            {
              name: "Product Variants on Airtable but not Prisma",
              number: productVariantsInAirtableButNotPrisma.length,
            },
          ],
        }),
        ...createReportSection({
          title: "Do product variant SKUs match?",
          datapoints: [
            {
              name: "Mismatched product variant SKUs",
              number: productVariantSKUMismatches.length,
              shouldFlagNum: true,
            },
          ],
        }),
        ...createReportSection({
          title: "Are SUIDs correct?",
          datapoints: [
            {
              name: "Mismatched SUID/SKU combos on Prisma",
              number: prismaSUIDToSKUMismatches.length,
              shouldFlagNum: true,
            },
            {
              name: "Mismatched SUID/SKU combos on Airtable",
              number: airtableSUIDToSKUMismatches.length,
              shouldFlagNum: true,
            },
          ],
        }),
        ...createReportSection({
          title: "Are the counts aligned?",
          datapoints: [
            {
              name:
                "Prisma: Number of Product Variants with incorrect number of physical products attached",
              number: prismaTotalPhysicalProductMisalignment.length,
              shouldFlagNum: true,
            },
            {
              name:
                "Airtable: Number of Product Variants with incorrect number of physical products attached",
              number: airtableTotalPhysicalProductMisalignment.length,
              shouldFlagNum: true,
            },
            {
              name: "Mismatched counts",
              number: countMisalignments.length,
              shouldFlagNum: true,
            },
          ],
        }),
        ...createReportSection({
          title: "Are physical product inventory statuses aligned?",
          datapoints: [
            {
              name:
                "Number of physical products with mismatching inventory statuses",
              number: mismatchingStatuses.length,
              shouldFlagNum: true,
            },
          ],
        }),
        ...createReportSection({
          title: "Are reservations aligned?",
          datapoints: [
            {
              name: "Reservations in prisma but not airtable",
              number: reservationsInPrismaButNotAirtable.length,
              shouldFlagNum: true,
            },
            {
              name: "Reservations in airtable but not prisma",
              number: reservationsInAirtableButNotPrisma.length,
              shouldFlagNum: true,
            },
            {
              name: "Reservations with mismatching products",
              number: misalignedSUIDsOnReservations.length,
              shouldFlagNum: true,
            },
            {
              name: "Reservations with mismatching statuses",
              number: misalignedStatusOnReservations.length,
              shouldFlagNum: true,
            },
            {
              name: "Reservations with more than 3 products",
              number: reservationsWithMoreThanThreeProducts.length,
              shouldFlagNum: true,
            },
          ],
        }),
        ...createReportSection({
          title: "Other",
          datapoints: [
            {
              name: "Errors",
              number: errors.length,
            },
          ],
          divider: false,
        }),
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `Note: \`Highlighted numbers\` need attention. For more details` +
              ` work with the health check script locally using \`yarn healthCheck:production\`` +
              `, printing more details as needed`,
          },
        },
      ],
    } as any
  } catch (err) {
    message = {
      ...message,
      text:
        `Error while running airtable/prisma health check. Please debug it ` +
        `locally using \`yarn healthCheck:production\`\n${err}`,
    } as any
  }

  await web.chat.postMessage(message)
}

interface DataPoint {
  name: string
  number: number
  shouldFlagNum?: boolean
}

const createReportSection = ({
  title,
  datapoints,
  divider = true,
}: {
  title: string
  datapoints: DataPoint[]
  divider?: boolean
}) => {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${title.toUpperCase()}*`,
      },
    },
  ]

  if (datapoints.length >= 1) {
    blocks.push({
      type: "section",
      fields: datapoints.map(p =>
        Identity({
          type: "mrkdwn",
          text: `*${p.name}*\n${flagIfNeeded(p.number, !!p.shouldFlagNum)}`,
        })
      ),
    } as any)
  }

  if (divider) {
    blocks.push({
      type: "divider",
    } as any)
  }

  return blocks
}

const flagIfNeeded = (num, shouldFlag) =>
  shouldFlag && num > 0 ? `\`${num}\`` : `${num}`
run()
