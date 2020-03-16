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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_1 = require("../../prisma");
var utils_1 = require("../utils");
var slugify_1 = __importDefault(require("slugify"));
var lodash_1 = require("lodash");
var utils_2 = require("./utils");
exports.syncCategories = function (cliProgressBar) { return __awaiter(void 0, void 0, void 0, function () {
    var allCategories, _a, multibar, _cliProgressBar, _i, allCategories_1, record, model, name_1, description, visible, image, slug, data, e_1, categories, _b, _tree, childrenMap, _c, categories_1, record, slug, children, data, updatedCategory, e_2;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, utils_1.getAllCategories()];
            case 1:
                allCategories = _e.sent();
                return [4 /*yield*/, utils_2.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
                        cliProgressBar: cliProgressBar,
                        numRecords: allCategories.length * 2,
                        modelName: "Categories",
                    })
                    // First create or update all categories
                ];
            case 2:
                _a = _e.sent(), multibar = _a[0], _cliProgressBar = _a[1];
                _i = 0, allCategories_1 = allCategories;
                _e.label = 3;
            case 3:
                if (!(_i < allCategories_1.length)) return [3 /*break*/, 9];
                record = allCategories_1[_i];
                _e.label = 4;
            case 4:
                _e.trys.push([4, 7, , 8]);
                _cliProgressBar.increment();
                model = record.model;
                name_1 = model.name, description = model.description, visible = model.visible, image = model.image;
                if (lodash_1.isEmpty(model) || lodash_1.isEmpty(name_1)) {
                    return [3 /*break*/, 8];
                }
                slug = slugify_1.default(name_1).toLowerCase();
                data = {
                    slug: slug,
                    name: name_1,
                    description: description,
                    visible: visible,
                    image: image,
                };
                return [4 /*yield*/, prisma_1.prisma.upsertCategory({
                        where: {
                            slug: slug,
                        },
                        create: data,
                        update: data,
                    })];
            case 5:
                _e.sent();
                return [4 /*yield*/, record.patchUpdate({
                        Slug: slug,
                    })];
            case 6:
                _e.sent();
                return [3 /*break*/, 8];
            case 7:
                e_1 = _e.sent();
                console.error(e_1);
                return [3 /*break*/, 8];
            case 8:
                _i++;
                return [3 /*break*/, 3];
            case 9:
                categories = allCategories.map(function (category) {
                    var parent = allCategories.findByIds(category.model.parent);
                    var model = parent && parent.model;
                    return {
                        slug: slugify_1.default(category.model.name).toLowerCase(),
                        name: category.model.name,
                        parent: model && {
                            slug: model.slug,
                            name: model.name,
                        },
                    };
                });
                _b = buildHierarchy(categories), _tree = _b[0], childrenMap = _b[1];
                _c = 0, categories_1 = categories;
                _e.label = 10;
            case 10:
                if (!(_c < categories_1.length)) return [3 /*break*/, 15];
                record = categories_1[_c];
                _e.label = 11;
            case 11:
                _e.trys.push([11, 13, , 14]);
                _cliProgressBar.increment();
                slug = record.slug;
                children = childrenMap[slug]
                    ? getLeafNodes([childrenMap[slug]])[0]
                    : [];
                data = {
                    slug: slug,
                    children: {
                        connect: children.map(function (_a) {
                            var slug = _a.slug;
                            return ({ slug: slug });
                        }),
                    },
                };
                return [4 /*yield*/, prisma_1.prisma.updateCategory({
                        where: {
                            slug: slug,
                        },
                        data: data,
                    })];
            case 12:
                updatedCategory = _e.sent();
                return [3 /*break*/, 14];
            case 13:
                e_2 = _e.sent();
                console.error(e_2);
                return [3 /*break*/, 14];
            case 14:
                _c++;
                return [3 /*break*/, 10];
            case 15:
                (_d = multibar) === null || _d === void 0 ? void 0 : _d.stop();
                return [2 /*return*/];
        }
    });
}); };
function buildHierarchy(items) {
    var roots = [];
    var children = {};
    // find the top level nodes and hash the children based on parent
    for (var i in items) {
        var item = items[i];
        var p = item.parent;
        var target = !p ? roots : children[p.slug] || (children[p.slug] = []);
        target.push(item);
    }
    // function to recursively build the tree
    var findChildren = function (parent) {
        if (children[parent.slug]) {
            parent.children = children[parent.slug];
            for (var _i = 0, _a = parent.children; _i < _a.length; _i++) {
                var child = _a[_i];
                findChildren(child);
            }
        }
    };
    // enumerate through to handle the case where there are multiple roots
    var result = {};
    for (var i in roots) {
        var root = roots[i];
        findChildren(roots[i]);
        result[root.slug] = roots[i];
    }
    return [result, children];
}
function getLeafNodes(nodes, result) {
    if (result === void 0) { result = []; }
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        if (!node.children) {
            result.push(node);
        }
        else {
            result = getLeafNodes(node.children, result);
        }
    }
    return result;
}
//# sourceMappingURL=syncCategories.js.map