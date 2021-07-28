import { Controller, Get } from "@nestjs/common"
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicator,
} from "@nestjs/terminus"

@Controller("health")
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check() {
    class MyHealthIndicator extends HealthIndicator {
      public check(key: string) {
        // Replace with the actual check
        const isHealthy = true
        // Returns { [key]: { status: 'up', message: 'Up and running' } }
        return super.getStatus(key, isHealthy, { message: "Up and running" })
      }
    }

    return this.health.check([
      async () => {
        const hi = new MyHealthIndicator()
        return hi.check(`monsoon-${process.env.NODE_ENV}`)
      },
    ])
  }
}
