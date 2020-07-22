import * as fs from "fs"

import { Customer } from "@app/prisma"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import zipcodes from "zipcodes"

@Injectable()
export class AdmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  weServiceZipcode(zipcode: string): boolean {
    const state = zipcodes.lookup(zipcode)?.state
    let { states } = JSON.parse(
      fs.readFileSync(
        process.cwd() + "/src/modules/User/admissableStates.json",
        "utf-8"
      )
    )
    return states.includes(state)
  }

  // TODO: Write function
  belowWeeklyNewUsersOpsThreshold(): boolean {
    return false
  }

  // TODO: Write function
  haveSufficientInventoryToServiceCustomer(customer: Customer): boolean {
    return false
  }
}
