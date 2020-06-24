import { CustomerWhereUniqueInput } from "@app/prisma"
import { Injectable } from "@nestjs/common"

@Injectable()
export class AdmissionsService {
  async shouldAdmitCustomer(
    where: CustomerWhereUniqueInput
  ): Promise<"Waitlisted" | "Admitted"> {
    /*
        If zipcode is not in a serviceable zipcode
          waitlist the user
    
        const possibleTopsForUser = getNumUnreservedTopsWithSize(user.topSize)
        const possibleBottomsForUser = getNumUnreservedBottomsWithSze(user.bottomSize)
    
        const CUSHION_COEFFICIENT = 5 
        // If we have enough inventory for member to place a reservation
        if sum(possibleTopsForUser, possibleBottomsForUser) >= 3 * CUSHION_COEFFICIENT {
          let the user in
        } else {
          waitlist the user
        } 
        */

    return "Waitlisted"
  }
}
