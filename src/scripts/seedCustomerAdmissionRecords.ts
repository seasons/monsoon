import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  await ps.client.createCustomerAdmissionsData({
    inServiceableZipcode: true,
    admissable: true,
  })

  await ps.client.createCustomerAdmissionsData({
    inServiceableZipcode: false,
    admissable: false,
    inAdmissableReason: "AutomaticAdmissionsFlagOff",
  })
  await ps.client.createCustomerAdmissionsData({
    inServiceableZipcode: true,
    admissable: false,
    inAdmissableReason: "AutomaticAdmissionsFlagOff",
  })

  await ps.client.createCustomerAdmissionsData({
    inServiceableZipcode: false,
    admissable: false,
    inAdmissableReason: "UnsupportedPlatform",
  })
  await ps.client.createCustomerAdmissionsData({
    inServiceableZipcode: true,
    admissable: false,
    inAdmissableReason: "UnsupportedPlatform",
  })

  await ps.client.createCustomerAdmissionsData({
    inServiceableZipcode: false,
    admissable: false,
    inAdmissableReason: "OpsThresholdExceeded",
  })
  await ps.client.createCustomerAdmissionsData({
    inServiceableZipcode: true,
    admissable: false,
    inAdmissableReason: "OpsThresholdExceeded",
  })

  await ps.client.createCustomerAdmissionsData({
    inServiceableZipcode: false,
    admissable: false,
    inAdmissableReason: "UnserviceableZipcode",
  })

  await ps.client.createCustomerAdmissionsData({
    inServiceableZipcode: false,
    admissable: false,
    inAdmissableReason: "InsufficientInventory",
  })
  await ps.client.createCustomerAdmissionsData({
    inServiceableZipcode: true,
    admissable: false,
    inAdmissableReason: "InsufficientInventory",
  })

  await ps.client.createCustomerAdmissionsData({
    inServiceableZipcode: false,
    admissable: false,
    inAdmissableReason: "Untriageable",
  })
  await ps.client.createCustomerAdmissionsData({
    inServiceableZipcode: true,
    admissable: false,
    inAdmissableReason: "Untriageable",
  })
}

run()
