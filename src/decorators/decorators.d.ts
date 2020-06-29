import { ExecutionContext } from "@nestjs/common"

import { Customer, User } from "../prisma"

export interface SeasonsExectionContext extends ExecutionContext {
  customer?: Customer
  user?: User
}
