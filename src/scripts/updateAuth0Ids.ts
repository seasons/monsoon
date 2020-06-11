import "module-alias/register"

import * as Airtable from "airtable"

import { AirtableBaseService } from "../modules/Airtable/services/airtable.base.service"
import { AirtableService } from "../modules/Airtable/services/airtable.service"
import { AirtableUtilsService } from "../modules/Airtable/services/airtable.utils.service"
import { AuthService } from "../modules/User/services/auth.service"
import { PrismaService } from "../prisma/prisma.service"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

const run = async () => {
  try {
    debugger
    const ps = new PrismaService()
    const abs = new AirtableBaseService()
    const authService = new AuthService(
      ps,
      new AirtableService(abs, new AirtableUtilsService(abs))
    )
    const prismaUsers = await ps.client.users({})

    const auth0Users = await authService.getAuth0Users()
    for (const prismaUser of prismaUsers) {
      const correspondingAuth0User = auth0Users.find(
        a => a.email === prismaUser.email
      )
      if (!!correspondingAuth0User) {
        console.log(
          `User w/Email: ${prismaUser.email} auth0ID synced with staging`
        )
        await ps.binding.mutation.updateUser({
          where: { id: prismaUser.id },
          data: { auth0Id: correspondingAuth0User.user_id.split("|")[1] },
        })
      }
    }
  } catch (err) {
    console.error(err)
  }
}

run()
