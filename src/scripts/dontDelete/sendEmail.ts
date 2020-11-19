import "module-alias/register"

import sgMail from "@sendgrid/mail"
import { head } from "lodash"

import { EmailDataProvider } from "../../modules/Email/services/email.data.service"
import { EmailService } from "../../modules/Email/services/email.service"
import { EmailUtilsService } from "../../modules/Email/services/email.utils.service"
import { ErrorService } from "../../modules/Error/services/error.service"
import { ImageService } from "../../modules/Image/services/image.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const ps = new PrismaService()
  const utilsService = new UtilsService(ps)
  const emailData = new EmailDataProvider()
  const emails = new EmailService(
    ps,
    utilsService,
    emailData,
    new EmailUtilsService(ps, new ErrorService(), new ImageService(ps))
  )

  try {
    const customerWithBillingAndUserData: any = head(
      await ps.binding.query.customers(
        { where: { id: "ckhnw8k79001u08067tdrfiyr" } },
        `
        {
          id
          billingInfo {
            id
          }
          user {
            id
            firstName
            lastName
            email
          }
          referrer {
            id
            user {
              id
              email
              firstName
            }
            membership {
              subscriptionId
            }
          }
        }
      `
      )
    )
    await emails.sendReferralConfirmationEmail({
      referrer: customerWithBillingAndUserData.referrer.user,
      referee: customerWithBillingAndUserData.user,
    })
  } catch (err) {
    console.log(err)
  }
}

run()
