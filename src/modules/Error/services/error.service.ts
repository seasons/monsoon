import { Injectable } from "@nestjs/common"
import * as Sentry from "@sentry/node"
import { User } from "../../../prisma"

@Injectable()
export class ErrorService {
  //   private shouldReportErrorsToSentry = process.env.NODE_ENV === "production"
  private shouldReportErrorsToSentry = true

  constructor() {}

  setUserContext(prismaUser: User) {
    if (this.shouldReportErrorsToSentry) {
      Sentry.configureScope(scope => {
        scope.setUser({ id: prismaUser.id, email: prismaUser.email })
      })
    }
  }

  captureError(err) {
    if (this.shouldReportErrorsToSentry) {
      Sentry.captureException(err)
    }
  }
}
