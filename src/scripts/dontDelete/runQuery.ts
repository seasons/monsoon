import "module-alias/register"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const customerID = "ckixg05o306ze0750gl0pi46k"
  const user = await ps.client2.user.create({
    data: {
      auth0Id: "hello11",
      email: "hello11@seasons.nyc",
      firstName: "Faiyam",
      lastName: "Rahman",
      roles: ["Customer"],
      pushNotification: {
        create: {
          interests: {
            create: ["type1", "type2"].map(type => ({
              type,
              value: "",
              status: true,
            })),
          },
          status: true,
        },
      },
      customer: {
        create: {
          // ...(!!utm?.source ||
          // !!utm?.medium ||
          // !!utm?.term ||
          // !!utm?.content ||
          // !!utm?.campaign
          //   ? { utm: { create: utm } }
          //   : {}),
          detail: {
            create: {
              phoneNumber: "3472626300",
              birthday: null,
              styles: [],
              shippingAddress: {
                create: {
                  zipCode: "11576",
                  city: "Roslyn",
                  state: "NY",
                },
              },
              discoveryReference: "google",
              impactId: null,
              insureShipment: false,
            },
          },
          admissions: {
            create: {
              allAccessEnabled: false,
              admissable: false,
              inServiceableZipcode: false,
              authorizationsCount: 0,
            },
          },
          status: "Created",
        },
      },
    },
    select: { id: true },
  })
  console.log("yo")
}
run()
