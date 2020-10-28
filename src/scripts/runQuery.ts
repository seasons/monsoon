import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const triageCustomerInfo = `{
    id
    status
    detail {
      shippingAddress {
        zipCode
      }
      topSizes
      waistSizes
    }
    user {
      id
      firstName
      lastName
      email
      emails {
        emailId
      }
    }
    admissions {
      authorizationsCount
    }
  }`
  const x = await ps.binding.query.customers(
    {
      where: {
        status_in: ["Invited", "Created", "Waitlisted", "Authorized"],
      },
    },
    triageCustomerInfo
  )
  console.log(x)
}

run()
