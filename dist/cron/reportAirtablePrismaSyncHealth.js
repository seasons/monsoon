"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_api_1 = require("@slack/web-api");
const utils_1 = require("../utils");
const airtableToPrismaHealthCheck_1 = require("./airtableToPrismaHealthCheck");
exports.run = () => __awaiter(void 0, void 0, void 0, function* () {
    let message = { channel: process.env.SLACK_DEV_CHANNEL_ID, text: "'" };
    try {
        const [productsInPrismaButNotAirtable, productsInAirtableButNotPrisma, physicalProductsInPrismaButNotAirtable, physicalProductsInAirtableButNotPrisma, productVariantsInPrismaButNotAirtable, productVariantsInAirtableButNotPrisma, productVariantSKUMismatches, prismaSUIDToSKUMismatches, airtableSUIDToSKUMismatches, countMisalignments, prismaTotalPhysicalProductMisalignment, airtableTotalPhysicalProductMisalignment, prismaCountToStatusMisalignments, airtableCountToStatusMisalignments, prismaProdVarsWithImpossibleCounts, mismatchingStatuses, reservationsInPrismaButNotAirtable, reservationsInAirtableButNotPrisma, misalignedSUIDsOnReservations, misalignedStatusOnReservations, reservationsWithMoreThanThreeProducts, errors,] = yield airtableToPrismaHealthCheck_1.checkProductsAlignment();
        message = Object.assign(Object.assign({}, message), { text: "", blocks: [
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
                    title: "Do products, physical products, and product variants align in number?",
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
                            name: "Prisma: Number of Product Variants with incorrect number of physical products attached",
                            number: prismaTotalPhysicalProductMisalignment.length,
                            shouldFlagNum: true,
                        },
                        {
                            name: "Airtable: Number of Product Variants with incorrect number of physical products attached",
                            number: airtableTotalPhysicalProductMisalignment.length,
                            shouldFlagNum: true,
                        },
                        {
                            name: "Mismatched counts",
                            number: countMisalignments.length,
                            shouldFlagNum: true,
                        },
                        {
                            name: "Prisma: Number of product variants with mismatching counts/statuses",
                            number: prismaCountToStatusMisalignments.length,
                            shouldFlagNum: true,
                        },
                        {
                            name: "Airtable: Number of product variants with mismatching counts/statuses",
                            number: airtableCountToStatusMisalignments.length,
                            shouldFlagNum: true,
                        },
                        {
                            name: "Prisma: Number of product variants with impossible counts",
                            number: prismaProdVarsWithImpossibleCounts.length,
                            shouldFlagNum: true,
                        },
                    ],
                }),
                ...createReportSection({
                    title: "Are physical product inventory statuses aligned?",
                    datapoints: [
                        {
                            name: "Number of physical products with mismatching inventory statuses",
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
                        text: `Note: \`Highlighted numbers\` need attention. For more details` +
                            ` work with the health check script locally using \`yarn healthCheck:production\`` +
                            `, printing more details as needed`,
                    },
                },
            ] });
    }
    catch (err) {
        message = Object.assign(Object.assign({}, message), { text: `Error while running airtable/prisma health check. Please debug it ` +
                `locally using \`yarn healthCheck:production\`\n${err}` });
    }
    yield new web_api_1.WebClient(process.env.SLACK_CANARY_API_TOKEN).chat.postMessage(message);
});
const createReportSection = ({ title, datapoints, divider = true, }) => {
    const blocks = [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*${title.toUpperCase()}*`,
            },
        },
    ];
    if (datapoints.length >= 1) {
        blocks.push({
            type: "section",
            fields: datapoints.map(p => utils_1.Identity({
                type: "mrkdwn",
                text: `*${p.name}*\n${flagIfNeeded(p.number, !!p.shouldFlagNum)}`,
            })),
        });
    }
    if (divider) {
        blocks.push({
            type: "divider",
        });
    }
    return blocks;
};
const flagIfNeeded = (num, shouldFlag) => shouldFlag && num > 0 ? `\`${num}\`` : `${num}`;
exports.run();
//# sourceMappingURL=reportAirtablePrismaSyncHealth.js.map