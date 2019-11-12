import express from "express"
import { base } from "../airtable/config"
import { prisma, User } from "../prisma"
import crypto from "crypto"
import sgMail from "@sendgrid/mail"
import { getUserIDHash, setCustomerPrismaStatus } from "../utils"

const app = express()
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

app.post("/airtable_events", async (req, res) => {
    const data = req.body
    for (let row of data) {
        const { tableId, recordId, updates } = row

        const record = await base(tableId).find(recordId)
        if (!record) {
            return res.sendStatus(400)
        }

        if (userBecameAuthorizedToSubscribe(updates)) {
            const user = await prisma.user({ email: record.fields.Email })
            setCustomerPrismaStatus(prisma, user, "Authorized")
            sendAuthorizedToSubscribeEmail(user)
        }

        // Check if record is Physical Product
        if (!!record.fields.SUID) {
            const { text: SUID } = record.fields.SUID
            const physicalProduct = await prisma.physicalProduct({
                seasonsUID: SUID,
            })
            const productVariant = await prisma
                .physicalProduct({
                    seasonsUID: SUID,
                })
                .productVariant()

            const currentInventoryStatus = physicalProduct.inventoryStatus
            const updatedInventoryStatus = updates.find(a => a.field)

            if (
                currentInventoryStatus === "NonReservable" &&
                updatedInventoryStatus === "Reservable"
            ) {
                await incrementReservableCount(productVariant, physicalProduct)
            } else if (
                currentInventoryStatus === "Reservable" &&
                updatedInventoryStatus === "Reserved"
            ) {
            }
        }
    }

    res.sendStatus(200)
})

const incrementReservableCount = async (productVariant, physicalProduct) => {
    await prisma.updateProductVariant({
        where: {
            sku: productVariant.sku,
        },
        data: {
            nonReservable:
                productVariant.nonReservable <= 0
                    ? 0
                    : productVariant.nonReservable - 1,
            reservable: productVariant.reservable + 1,
        },
    })

    console.log(physicalProduct, productVariant)
}

interface Update {
    field: string
    newValue: string
}

function userBecameAuthorizedToSubscribe(updates: Array<Update>): boolean {
    for (let update of updates) {
        const { field, newValue } = update
        if (field === "Status" && newValue === "Authorized") {
            return true
        }
    }
    return false
}

function sendAuthorizedToSubscribeEmail(user: User) {
    const msg = {
        to: user.email,
        from: "membership@seasons.nyc",
        templateId: "d-a62e1c840166432abd396d1536e4489d",
        dynamic_template_data: {
            name: user.firstName,
            url: `${process.env.SEEDLING_URL}/complete?idHash=${getUserIDHash(
                user.id
            )}`,
        },
    }
    sgMail.send(msg)
}

export { app }
