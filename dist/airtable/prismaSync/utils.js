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
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var prisma_1 = require("../../prisma");
exports.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded = function (_a) {
    var cliProgressBar = _a.cliProgressBar, numRecords = _a.numRecords, modelName = _a.modelName;
    return __awaiter(void 0, void 0, void 0, function () {
        var multibar, _cliProgressBar;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _cliProgressBar = cliProgressBar;
                    if (!!_cliProgressBar) return [3 /*break*/, 2];
                    multibar = utils_1.makeAirtableSyncCliProgressBar();
                    return [4 /*yield*/, exports.createSubBar({
                            multibar: multibar,
                            modelName: modelName,
                            numRecords: numRecords,
                        })];
                case 1:
                    _cliProgressBar = _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/, [multibar, _cliProgressBar]];
            }
        });
    });
};
exports.createSubBar = function (_a) {
    var multibar = _a.multibar, modelName = _a.modelName, numRecords = _a.numRecords, numRecordsModifier = _a.numRecordsModifier;
    return __awaiter(void 0, void 0, void 0, function () {
        var _numRecords, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _numRecords = !!numRecordsModifier && !!numRecords
                        ? numRecordsModifier(numRecords)
                        : numRecords;
                    _c = (_b = multibar).create;
                    _d = _numRecords;
                    if (_d) return [3 /*break*/, 2];
                    return [4 /*yield*/, utils_1.getNumRecords(modelName)];
                case 1:
                    _d = (_e.sent());
                    _e.label = 2;
                case 2: return [2 /*return*/, _c.apply(_b, [_d, 0, {
                            modelName: ("" + modelName).padEnd("Homepage Product Rails".length + 1, " "),
                        }])];
            }
        });
    });
};
exports.deepUpsertSize = function (_a) {
    var slug = _a.slug, type = _a.type, display = _a.display, topSizeData = _a.topSizeData, bottomSizeData = _a.bottomSizeData;
    return __awaiter(void 0, void 0, void 0, function () {
        var sizeData, sizeRecord, _b, prismaTopSize, topSize, prismaBottomSize, bottomSize;
        var _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    sizeData = { slug: slug, productType: type, display: display };
                    return [4 /*yield*/, prisma_1.prisma.upsertSize({
                            where: { slug: slug },
                            create: __assign({}, sizeData),
                            update: __assign({}, sizeData),
                        })];
                case 1:
                    sizeRecord = _f.sent();
                    _b = type;
                    switch (_b) {
                        case "Top": return [3 /*break*/, 2];
                        case "Bottom": return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 11];
                case 2:
                    if (!topSizeData) {
                        throw new Error("topSizeData must be non null if type is Top");
                    }
                    return [4 /*yield*/, prisma_1.prisma.size({ id: sizeRecord.id }).top()];
                case 3:
                    prismaTopSize = _f.sent();
                    return [4 /*yield*/, prisma_1.prisma.upsertTopSize({
                            where: { id: ((_c = prismaTopSize) === null || _c === void 0 ? void 0 : _c.id) || "" },
                            update: __assign({}, topSizeData),
                            create: __assign({}, topSizeData),
                        })];
                case 4:
                    topSize = _f.sent();
                    if (!!prismaTopSize) return [3 /*break*/, 6];
                    return [4 /*yield*/, prisma_1.prisma.updateSize({
                            where: { slug: slug },
                            data: { top: { connect: { id: topSize.id } } },
                        })];
                case 5:
                    _f.sent();
                    _f.label = 6;
                case 6: return [3 /*break*/, 11];
                case 7:
                    if (!bottomSizeData) {
                        throw new Error("bottomSizeData must be non null if type is Bottom");
                    }
                    return [4 /*yield*/, prisma_1.prisma
                            .size({ id: (_d = sizeRecord) === null || _d === void 0 ? void 0 : _d.id })
                            .bottom()];
                case 8:
                    prismaBottomSize = _f.sent();
                    return [4 /*yield*/, prisma_1.prisma.upsertBottomSize({
                            where: { id: ((_e = prismaBottomSize) === null || _e === void 0 ? void 0 : _e.id) || "" },
                            create: __assign({}, bottomSizeData),
                            update: __assign({}, bottomSizeData),
                        })];
                case 9:
                    bottomSize = _f.sent();
                    if (!!prismaBottomSize) return [3 /*break*/, 11];
                    return [4 /*yield*/, prisma_1.prisma.updateSize({
                            where: { slug: slug },
                            data: { bottom: { connect: { id: bottomSize.id } } },
                        })];
                case 10:
                    _f.sent();
                    _f.label = 11;
                case 11: return [2 /*return*/, sizeRecord];
            }
        });
    });
};
//# sourceMappingURL=utils.js.map