import "module-alias/register"

import sgMail from "@sendgrid/mail"
import { head } from "lodash"

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
  const emails = new EmailService(
    ps,
    utilsService,
    new EmailUtilsService(ps, new ErrorService(), new ImageService(ps))
  )

  try {
    const customerWithBillingAndUserData: any = head(
      await ps.binding.query.customers(
        { where: { user: { email: "faiyam+unsubscribe@seasons.nyc" } } },
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
    await emails.sendAuthorizedDayTwoFollowup(
      customerWithBillingAndUserData.user
    )
  } catch (err) {
    console.log(err)
  }
}

run()
