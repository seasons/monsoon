import { execSync } from "child_process"

import { Injectable } from "@nestjs/common"
import { cloneDeep } from "lodash"
import { Command, Positional } from "nestjs-command"

import { HerokuService } from "../services/heroku.service"

@Injectable()
export class HerokuCommands {
  constructor(private readonly heroku: HerokuService) {}

  @Command({
    command: "get:production-commit",
    describe: "gets the latest commit to be deployed on monsoon-production",
    aliases: "gpc",
  })
  async create() {
    const hash = this.heroku.getMonsoonProductionCommit()
    console.log(`Current production commit for monsoon-production: ${hash}`)
    console.log(
      `View diff with master: http://github.com/seasons/monsoon/compare/${hash}..master`
    )

    execSync(`git checkout ${hash}`)
    execSync(`yarn prisma reset`)
    execSync(`yarn prisma:deploy`)
    execSync(`monsoon spp`)
  }
}
