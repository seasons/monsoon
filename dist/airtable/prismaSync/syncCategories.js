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
const prisma_1 = require("../../prisma");
const utils_1 = require("../utils");
const slugify_1 = __importDefault(require("slugify"));
const lodash_1 = require("lodash");
exports.syncCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    const allCategories = yield utils_1.getAllCategories();
    // First create or update all categories
    for (let record of allCategories) {
        try {
            const { model } = record;
            const { name, description, visible, image } = model;
            if (lodash_1.isEmpty(model) || lodash_1.isEmpty(name)) {
                continue;
            }
            const slug = slugify_1.default(name).toLowerCase();
            const data = {
                slug,
                name,
                description,
                visible,
                image,
            };
            const category = yield prisma_1.prisma.upsertCategory({
                where: {
                    slug,
                },
                create: data,
                update: data,
            });
            yield record.patchUpdate({
                Slug: slug,
            });
            console.log(category);
        }
        catch (e) {
            console.error(e);
        }
    }
    const categories = allCategories.map(category => {
        const parent = allCategories.findByIds(category.model.parent);
        const model = parent && parent.model;
        return {
            slug: slugify_1.default(category.model.name).toLowerCase(),
            name: category.model.name,
            parent: model && {
                slug: model.slug,
                name: model.name,
            },
        };
    });
    const [_tree, childrenMap] = buildHierarchy(categories);
    // Then link them to each other
    for (let record of categories) {
        try {
            const slug = record.slug;
            const children = childrenMap[slug]
                ? getLeafNodes([childrenMap[slug]])[0]
                : [];
            const data = {
                slug,
                children: {
                    connect: children.map(({ slug }) => ({ slug })),
                },
            };
            const updatedCategory = yield prisma_1.prisma.updateCategory({
                where: {
                    slug,
                },
                data,
            });
            console.log(slug, updatedCategory);
        }
        catch (e) {
            console.error(e);
        }
    }
});
function buildHierarchy(items) {
    let roots = [], children = {};
    // find the top level nodes and hash the children based on parent
    for (let i in items) {
        const item = items[i];
        const p = item.parent;
        const target = !p ? roots : children[p.slug] || (children[p.slug] = []);
        target.push(item);
    }
    // function to recursively build the tree
    const findChildren = function (parent) {
        if (children[parent.slug]) {
            parent.children = children[parent.slug];
            for (let child of parent.children) {
                findChildren(child);
            }
        }
    };
    // enumerate through to handle the case where there are multiple roots
    const result = {};
    for (let i in roots) {
        const root = roots[i];
        findChildren(roots[i]);
        result[root.slug] = roots[i];
    }
    return [result, children];
}
function getLeafNodes(nodes, result = []) {
    for (let node of nodes) {
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