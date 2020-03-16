"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var web_api_1 = require("@slack/web-api");
var utils_1 = require("../utils");
var airtableToPrismaHealthCheck_1 = require("./airtableToPrismaHealthCheck");
exports.run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var message, _a, productsInPrismaButNotAirtable, productsInAirtableButNotPrisma, physicalProductsInPrismaButNotAirtable, physicalProductsInAirtableButNotPrisma, productVariantsInPrismaButNotAirtable, productVariantsInAirtableButNotPrisma, productVariantSKUMismatches, prismaSUIDToSKUMismatches, airtableSUIDToSKUMismatches, countMisalignments, prismaTotalPhysicalProductMisalignment, airtableTotalPhysicalProductMisalignment, prismaCountToStatusMisalignments, airtableCountToStatusMisalignments, prismaProdVarsWithImpossibleCounts, mismatchingStatuses, reservationsInPrismaButNotAirtable, reservationsInAirtableButNotPrisma, misalignedSUIDsOnReservations, misalignedStatusOnReservations, reservationsWithMoreThanThreeProducts, errors, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                message = { channel: process.env.SLACK_DEV_CHANNEL_ID, text: "'" };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, airtableToPrismaHealthCheck_1.checkProductsAlignment()];
            case 2:
                _a = _b.sent(), productsInPrismaButNotAirtable = _a[0], productsInAirtableButNotPrisma = _a[1], physicalProductsInPrismaButNotAirtable = _a[2], physicalProductsInAirtableButNotPrisma = _a[3], productVariantsInPrismaButNotAirtable = _a[4], productVariantsInAirtableButNotPrisma = _a[5], productVariantSKUMismatches = _a[6], prismaSUIDToSKUMismatches = _a[7], airtableSUIDToSKUMismatches = _a[8], countMisalignments = _a[9], prismaTotalPhysicalProductMisalignment = _a[10], airtableTotalPhysicalProductMisalignment = _a[11], prismaCountToStatusMisalignments = _a[12], airtableCountToStatusMisalignments = _a[13], prismaProdVarsWithImpossibleCounts = _a[14], mismatchingStatuses = _a[15], reservationsInPrismaButNotAirtable = _a[16], reservationsInAirtableButNotPrisma = _a[17], misalignedSUIDsOnReservations = _a[18], misalignedStatusOnReservations = _a[19], reservationsWithMoreThanThreeProducts = _a[20], errors = _a[21];
                message = __assign(__assign({}, message), { text: "", blocks: __spreadArrays([
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: ":newspaper: *Airtable-Prisma Products Parity Health Check* :newspaper:",
                            },
                        },
                        {
                            type: "context",
                            elements: [
                                {
                                    type: "mrkdwn",
                                    text: "*" + new Date().toLocaleDateString() + "*",
                                },
                            ],
                        }
                    ], createReportSection({
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
                    }), createReportSection({
                        title: "Do product variant SKUs match?",
                        datapoints: [
                            {
                                name: "Mismatched product variant SKUs",
                                number: productVariantSKUMismatches.length,
                                shouldFlagNum: true,
                            },
                        ],
                    }), createReportSection({
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
                    }), createReportSection({
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
                    }), createReportSection({
                        title: "Are physical product inventory statuses aligned?",
                        datapoints: [
                            {
                                name: "Number of physical products with mismatching inventory statuses",
                                number: mismatchingStatuses.length,
                                shouldFlagNum: true,
                            },
                        ],
                    }), createReportSection({
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
                    }), createReportSection({
                        title: "Other",
                        datapoints: [
                            {
                                name: "Errors",
                                number: errors.length,
                            },
                        ],
                        divider: false,
                    }), [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: "Note: `Highlighted numbers` need attention. For more details" +
                                    " work with the health check script locally using `yarn healthCheck:production`" +
                                    ", printing more details as needed",
                            },
                        },
                    ]) });
                return [3 /*break*/, 4];
            case 3:
                err_1 = _b.sent();
                message = __assign(__assign({}, message), { text: "Error while running airtable/prisma health check. Please debug it " +
                        ("locally using `yarn healthCheck:production`\n" + err_1) });
                return [3 /*break*/, 4];
            case 4: return [4 /*yield*/, new web_api_1.WebClient(process.env.SLACK_CANARY_API_TOKEN).chat.postMessage(message)];
            case 5:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var createReportSection = function (_a) {
    var title = _a.title, datapoints = _a.datapoints, _b = _a.divider, divider = _b === void 0 ? true : _b;
    var blocks = [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: "*" + title.toUpperCase() + "*",
            },
        },
    ];
    if (datapoints.length >= 1) {
        blocks.push({
            type: "section",
            fields: datapoints.map(function (p) {
                return utils_1.Identity({
                    type: "mrkdwn",
                    text: "*" + p.name + "*\n" + flagIfNeeded(p.number, !!p.shouldFlagNum),
                });
            }),
        });
    }
    if (divider) {
        blocks.push({
            type: "divider",
        });
    }
    return blocks;
};
var flagIfNeeded = function (num, shouldFlag) {
    return shouldFlag && num > 0 ? "`" + num + "`" : "" + num;
};
exports.run();
//# sourceMappingURL=reportAirtablePrismaSyncHealth.js.map