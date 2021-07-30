import { Inject, Injectable } from "@nestjs/common"
import { CONTEXT } from "@nestjs/graphql"

@Injectable()
export class PrismaUtilsService {
  constructor(@Inject(CONTEXT) private readonly context) {}

  requestIsOnMutation(): Boolean {
    return this.context.isMutation
  }
}

// For use in application contexts that dont have a Context
@Injectable()
export class MockPrismaUtilsService {
  requestIsOnMutation(): Boolean {
    return false
  }
}
