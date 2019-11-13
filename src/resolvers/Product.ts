import { Context } from "../utils"
import { getUserId, getCustomerFromContext } from "../auth/utils"
import sgMail from "@sendgrid/mail"
import { ProductVariantUpdateInput, ReservationCreateInput, User, Product as PrismaProduct, Prisma, Reservation } from "../prisma"
import { getAllProductVariants, createReservation } from "../airtable/utils"
import { ApolloError } from "apollo-server"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const Product = {
    async isSaved(parent, { }, ctx: Context, info) {
        const customer = await getCustomerFromContext(ctx)

        const product = await ctx.prisma
            .customer({
                id: customer.id,
            })
            .savedProducts({
                where: {
                    id: parent.id,
                },
            })

        return !!product.length
    },
}

export const ProductMutations = {
    async reserveItems(
        parent,
        { items, options = { dryRun: false } },
        ctx: Context,
        info
    ) {
        const user = await getUserId(ctx)
        const customer = await getCustomerFromContext(ctx)

        const physicalProducts = await ctx.prisma.physicalProducts({
            where: {
                productVariant: {
                    id_in: items,
                },
            },
        })

        const products = await updateProductVariantCounts(
            items,
            physicalProducts,
            ctx,
            options
        )

        // Notify user about reservation via email
        // Create reservation record in airtable

        if (!options.dryRun) {
            const physicalProductSUIDs = physicalProducts.map(p => ({
                seasonsUID: p.seasonsUID,
            }))
            const reservationData = {
                products: {
                    connect: physicalProductSUIDs,
                },
                customer: {
                    connect: {
                        id: customer.id,
                    },
                },
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                shippingLabel: {
                    create: {
                        image: "",
                        name: "USPS",
                    },
                },
                reservationNumber: Math.floor(Math.random() * 90000) + 10000,
                shipped: false,
                status: "InQueue",
            } as ReservationCreateInput

            const reservation = await ctx.prisma.createReservation(reservationData)
            createReservation(user, reservationData)
            await sendReservationConfirmationEmail(ctx.prisma, user, products, reservation)

            return reservation
        } else {
            return {
                success: true,
            }
        }


    },
    async checkItemsAvailability(parent, { items }, ctx: Context, info) {
        const user = await getUserId(ctx)
        console.log(user, items)

        const physicalProducts = await ctx.prisma.physicalProducts({
            where: {
                productVariant: {
                    id_in: items,
                },
            },
        })

        await updateProductVariantCounts(items, physicalProducts, ctx, {
            dryRun: true,
        })

        return true
    },
}

const updateProductVariantCounts = async (
    items,
    physicalProducts,
    ctx,
    { dryRun } = { dryRun: false }
) => {
    // Check if physical product is available for each product variant
    const variants = await ctx.prisma.productVariants({
        where: { id_in: items },
    })

    const unavailableVariants = variants.filter(v => v.reservable <= 0)
    if (unavailableVariants.length > 0) {
        throw new ApolloError(
            "The following item is not reservable",
            "511",
            unavailableVariants
        )
    }

    const availablePhysicalProducts = []
    for (let physicalProduct of physicalProducts) {
        if (true) {
            // if (physicalProduct.inventoryStatus === "Reservable") {
            availablePhysicalProducts.push(physicalProduct)
        }
    }

    if (availablePhysicalProducts.length < 3) {
        // TODO: list out unavailable items
        throw new ApolloError("Must reserve at least 3 items a time", "515")
    }

    const allProductVariants = await getAllProductVariants()
    const variantSlugs = variants.map(a => a.sku)
    const productVariants = allProductVariants.filter(a =>
        variantSlugs.includes(a.model.sKU)
    )
    const products = []

    //TODO: convert to transaction
    for (let variant of variants) {
        const iProduct = await ctx.prisma
            .productVariant({ id: variant.id })
            .product()

        products.push(iProduct)
        console.log(iProduct, variant)

        if (!dryRun) {
            const data = {
                reservable: variant.reservable - 1,
                reserved: variant.reserved + 1,
            } as ProductVariantUpdateInput

            try {
                const update = ctx.prisma.updateProductVariant({
                    where: {
                        id: variant.id,
                    },
                    data,
                })

                const { reservable, reserved, nonReservable } = await update

                // Airtable record of product variant
                const aProductVariant = productVariants.find(
                    a => a.model.sKU === variant.sku
                )

                aProductVariant.patchUpdate({
                    "Reservable Count": reservable,
                    "Reserved Count": reserved,
                    "Non-Reservable Count": nonReservable,
                })
            } catch (e) {
                console.log(e)
            }
        }
    }

    return products
}

async function sendReservationConfirmationEmail(prisma: Prisma, user: User, products: Array<PrismaProduct>, reservation: Reservation) {
    const prod1Data = await getReservationConfirmationDataForProduct(prisma, products[0], "item1")
    const prod2Data = await getReservationConfirmationDataForProduct(prisma, products[1], "item2")
    const prod3Data = await getReservationConfirmationDataForProduct(prisma, products[2], "item3")
    const msg = {
        to: user.email,
        from: "membership@seasons.nyc",
        templateId: "d-f1de06bb4b89408e8059c07eb30d9f8f",
        dynamic_template_data: {
            order_number: reservation.reservationNumber,
            ...prod1Data,
            ...prod2Data,
            ...prod3Data,
        },
    }
    sgMail.send(msg)

    // *************************************************************************
    async function getReservationConfirmationDataForProduct(prisma: Prisma, product: PrismaProduct, prefix: String) {
        let data = {}
        data[`${prefix}_url`] = product.images[0].url
        data[`${prefix}_brand`] = await prisma.product({ id: product.id }).brand().name()
        data[`${prefix}_name`] = product.name
        data[`${prefix}_price`] = product.retailPrice
        return data
    }
}

