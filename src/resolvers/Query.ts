import { getUserId, Context } from "../auth/utils"
import { ProductWhereInput } from "../prisma"

export const Query = {
    async me(parent, args, ctx: Context) {
        const id = await getUserId(ctx)
        return ctx.prisma.user({ id })
    },
    products(parent, args, ctx: Context, info) {
        const { categoryName, ...rest } = args
        const options = {
            where: categoryName
                ? ({
                    category: {
                        name: categoryName,
                    },
                } as ProductWhereInput)
                : null,
            ...rest,
        }
        return ctx.db.query.productsConnection(options, info)
    },
    product: (parent, args, ctx: Context, info) =>
        ctx.db.query.product(args, info),
    categories: (parent, args, ctx: Context, info) =>
        ctx.db.query.categories(args, info),
}
