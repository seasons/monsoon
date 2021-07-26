import { ArgumentsHost, Catch, Logger } from "@nestjs/common"
import { BaseExceptionFilter } from "@nestjs/core"
import { GqlArgumentsHost, GqlContextType } from "@nestjs/graphql"

import { ErrorService } from "../services/error.service"

@Catch()
export class SentryFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(SentryFilter.name)

  constructor(private readonly error: ErrorService) {
    super()
  }

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() === "http") {
      // If its a normal http request, handle it one way
      const req = host.switchToHttp().getRequest<Request>()
      this.error.setExtraContext(req, "request")
      this.error.captureError(exception)
      super.catch(exception, host)

      // send logs to Datadog
      this.logger.error(exception)
    } else if (host.getType<GqlContextType>() === "graphql") {
      // If its a graphql request, handle it one way
      const gqlHost = GqlArgumentsHost.create(host)
      this.error.setExtraContext(gqlHost.getContext(), "context")
      this.error.captureError(exception)

      // send logs to Datadog
      this.logger.error(exception)
      return exception
    } else {
      throw new Error(`Unexpected host type: ${host.getType()}`)
    }
  }
}
