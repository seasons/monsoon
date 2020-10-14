import { execSync } from "child_process"

import { Injectable } from "@nestjs/common"
import { Command, Positional } from "nestjs-command"

@Injectable()
export class HerokuCommands {
  @Command({
    command: "get:production-commit",
    describe: "gets the latest commit to be deployed on monsoon-production",
    aliases: "gpc",
  })
  async create() {
    const releases = JSON.parse(
      execSync(`heroku releases --app monsoon-production --json`).toString()
    ) as { description: string; version: number }[]

    let release = releases.shift()
    // get past any env var updates
    while (!!release.description.match(/Set/)) {
      if (releases.length === 0) {
        return "Unable to retrieve latest commit. Please see: https://dashboard.heroku.com/apps/monsoon-production"
      }
      release = releases.shift()
    }

    let activeRelease = release // clean deploy
    if (!!release.description.match(/Rollback/)) {
      const activeVersion = Number(
        release.description.slice(
          // e.g "Rollback to v188" -> 13
          release.description.match(/\d{1,5}$/).index
        )
      )
      activeRelease = releases.find(r => r.version === activeVersion)
    }

    console.log(
      `Current production commit for monsoon-production: ${this.extractCommitHash(
        activeRelease
      )}`
    )
  }

  private extractCommitHash = release => {
    const description = release.description
    const hashIndex = description.match(/[0-9a-z]{8}$/).index

    return description.slice(hashIndex)
  }
}
