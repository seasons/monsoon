import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from "nest-winston"
import { format, transports } from "winston"

const httpTransportOptions = {
  host: "http-intake.logs.datadoghq.com",
  path: `/v1/input/${process.env.DATADOG_KEY}?ddsource=nodejs&service=monsoon-${process.env.NODE_ENV}`,
  ssl: true,
}

export default {
  logger: WinstonModule.createLogger({
    level: "info",
    exitOnError: false,
    format: format.json(),
    transports: [
      new transports.Console({
        format: format.combine(
          format.timestamp(),
          format.ms(),
          nestWinstonModuleUtilities.format.nestLike()
        ),
      }),
      new transports.Http(httpTransportOptions),
    ],
  }),
}
