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
  try {
    const x = await ps.binding.query.user(
      {
        where: {
          id: "ckhqv491y026o09065zcro1a2",
        },
      },
      `{id beamsToken}`
    )
  } catch (err) {
    console.log(err)
  }
}

run()
