import { LoggerService } from "@nestjs/common"
import { Logger } from "winston"

export class WinstonLogger implements LoggerService {
  constructor(public readonly logger: Logger) {}

  public log(message: any, context?: any) {
    return this.logger.info(message, {
      context,
    })
  }

  public error(message: any, context?: any): any {
    return this.logger.error(message, { context })
  }

  public warn(message: any, context?: any): any {
    return this.logger.warn(message, {
      context,
    })
  }

  public debug(message: any, context?: any): any {
    return this.logger.debug(message, {
      context,
    })
  }

  public verbose(message: any, context?: any): any {
    return this.logger.verbose(message, {
      context,
    })
  }

  public setContext(context: any) {
    this.logger.defaultMeta = context
  }
}
