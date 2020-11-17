import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const x = await ps.binding.query.customers(
    {
      where: { AND: [{ status: "Authorized" }] },
    },
    `{
        user {
            id
            email
            emails {
                emailId
            }
        }
        status
        authorizedAt
        reservations {
            id
        }
    }`
  )
  const y = x.filter(
    a =>
      a.authorizedAt == null &&
      !a.user.email.includes("alexisohanian") &&
      !a.user.emails.map(b => b.emailId).includes("Rewaitlisted")
  )
  console.log(y.map(a => a.user.email))
  console.log(y.length)
}

run()
