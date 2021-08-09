import { Injectable } from "@nestjs/common"
import { User } from "@prisma/client"
import * as Sentry from "@sentry/node"

@Injectable()
export class ErrorService {
  private shouldReportErrorsToSentry = process.env.NODE_ENV === "production"

  constructor() {}

  setUserContext(prismaUser: Pick<User, "id" | "email">) {
    if (this.shouldReportErrorsToSentry) {
      Sentry.configureScope(scope => {
        scope.setUser({
          id: prismaUser?.id || "",
          email: prismaUser?.email || "",
        })
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

  captureMessage(message) {
    if (this.shouldReportErrorsToSentry) {
      Sentry.captureMessage(message)
    }
  }
}
