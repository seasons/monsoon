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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const cli_progress_1 = __importDefault(require("cli-progress"));
const utils_1 = require("./utils");
const checkTableAlignment_1 = require("./checkTableAlignment");
exports.syncAll = () => __awaiter(void 0, void 0, void 0, function* () {
    // Note that the order matters here in order to properly link between tables.
    console.log(`\nNote: If you encounter errors, it's probably a field configuration issue on the destination base\n`);
    console.log(`Checking table alignments to surface would-be sync errors early...`);
    yield checkTableAlignment_1.checkAllTableAlignment();
    const multibar = new cli_progress_1.default.MultiBar({
        clearOnComplete: false,
        hideCursor: true,
        format: `{modelName} {bar} {percentage}%  ETA: {eta}s  {value}/{total} ops`,
    }, cli_progress_1.default.Presets.shades_grey);
    const bars = {
        colors: yield createSubBar(multibar, "Colors"),
        brands: yield createSubBar(multibar, "Brands"),
        models: yield createSubBar(multibar, "Models"),
        categories: yield createSubBar(multibar, "Categories"),
        locations: yield createSubBar(multibar, "Locations"),
        products: yield createSubBar(multibar, "Products"),
        homepageProductRails: yield createSubBar(multibar, "Homepage Product Rails"),
        productVariants: yield createSubBar(multibar, "Product Variants"),
        physicalProducts: yield createSubBar(multibar, "Physical Products"),
        users: yield createSubBar(multibar, "Users"),
        reservations: yield createSubBar(multibar, "Reservations"),
    };
    try {
        yield _1.syncColors(bars.colors);
        yield _1.syncBrands(bars.brands);
        yield _1.syncModels(bars.models);
        yield _1.syncCategories(bars.categories);
        yield _1.syncLocations(bars.locations);
        yield _1.syncProducts(bars.products);
        yield _1.syncHomepageProductRails(bars.homepageProductRails);
        yield _1.syncProductVariants(bars.productVariants);
        yield _1.syncPhysicalProducts(bars.physicalProducts);
        yield _1.syncUsers(bars.users);
        yield _1.syncReservations(bars.reservations);
    }
    catch (err) {
        console.log(err);
    }
    finally {
        multibar.stop();
    }
});
const createSubBar = (multibar, modelName) => __awaiter(void 0, void 0, void 0, function* () {
    return multibar.create(yield utils_1.getNumReadWritesToSyncModel(modelName), 0, {
        modelName: `${modelName}:`.padEnd("Homepage Product Rails".length + 1, " "),
    });
});
//# sourceMappingURL=syncAll.js.map