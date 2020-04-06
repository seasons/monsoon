import * as Sentry from "@sentry/node"

import { Injectable } from "@nestjs/common"
import { User } from "@prisma/index"

@Injectable()
export class ErrorService {
  private shouldReportErrorsToSentry = process.env.NODE_ENV === "production"

  constructor() {}

  setUserContext(prismaUser: User) {
    if (this.shouldReportErrorsToSentry) {
      Sentry.configureScope(scope => {
        scope.setUser({ id: prismaUser.id, email: prismaUser.email })
      })
    }
  }

  setExtraContext(dict: Object, keyPrefix?: string) {
    if (this.shouldReportErrorsToSentry) {
      Sentry.configureScope(scope => {
        for (const key of Object.keys(dict)) {
          scope.setExtra(`${keyPrefix}.${key}`, dict[key])
        }
      })
    }
  }

  captureError(err) {
    if (this.shouldReportErrorsToSentry) {
      Sentry.captureException(err)
    }
  }
}
