import "module-alias/register"

import { AuthService } from "../modules/User/services/auth.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const authService = new AuthService(ps, null, null)
  await authService.signupUser({
    email: "emailme@gmail.com",
    password: "fasdfasdf",
    firstName: "firstName",
    lastName: "LastName",
    details: { phoneNumber: "111-111-1111", birthday: "1990-01-01" },
  })
}

run()
