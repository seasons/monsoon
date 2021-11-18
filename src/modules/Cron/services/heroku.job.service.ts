import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import fetch from "node-fetch"

@Injectable()
export class HerokuJobs {
  private readonly logger = new Logger(`Cron: ${HerokuJobs.name}`)
  private token: string = null

  @Cron(CronExpression.EVERY_MINUTE)
  async restartDynos() {
    await this.checkIfDynoNeedsToBeRestarted()
  }

  async authenticateWithHeroku() {
    const res = await fetch("https://api.heroku.com/oauth/authorizations", {
      method: "POST",
      body: JSON.stringify({
        description: "sample description",
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.HEROKU_AUTH}`,
        Accept: "application/vnd.heroku+json; version=3",
      },
    })
    return res.json()
  }

  async getDynos(app) {
    const dynos = await fetch(`https://api.heroku.com/apps/${app}/dynos`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.heroku+json; version=3",
        Authorization: `Bearer ${this.token}`,
      },
    }).then(res => res.json())

    for (const dyno of dynos) {
      const { name, state } = dyno
      this.logger.log(`${name} is ${state}`)
    }

    const downDynos = dynos.filter(dyno => dyno.state === "crashed")

    for (let downDyno of downDynos) {
      const res = await fetch(
        `https://api.heroku.com/apps/${app}/dynos/${downDyno.name}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/vnd.heroku+json; version=3",
            Authorization: `Bearer ${this.token}`,
          },
        }
      ).then(res => res.json())

      this.logger.log(`♺  Restarting ${downDyno.name}...`, res)
    }
  }

  async checkIfDynoNeedsToBeRestarted() {
    const tokenData = await this.authenticateWithHeroku()
    const { access_token } = tokenData

    this.token = access_token.token

    await this.getDynos("monsoon-production")
  }
}
