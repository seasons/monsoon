import { LoggerService } from "@nestjs/common"
import { Logger } from "winston"

export class WinstonLogger implements LoggerService {
  constructor(public readonly logger: Logger) {}

  public log(message: any, context?: string) {
    return this.logger.info(message, {
      context,
    })
  }

  public error(message: any, trace?: string, context?: string): any {
    return this.logger.error(message, {
      trace,
      context,
    })
  }

  public warn(message: any, context?: string): any {
    return this.logger.warn(message, {
      context,
    })
  }

  public debug(message: any, context?: string): any {
    return this.logger.debug(message, {
      context,
    })
  }

  public verbose(message: any, context?: string): any {
    return this.logger.verbose(message, {
      context,
    })
  }

  public setContext(context: any) {
    this.logger.defaultMeta = context
  }
}
