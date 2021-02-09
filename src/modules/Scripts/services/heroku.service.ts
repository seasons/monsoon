import { execSync } from "child_process"

import { Injectable } from "@nestjs/common"
import { cloneDeep } from "lodash"

@Injectable()
export class HerokuService {
  constructor() {}

  getMonsoonProductionCommit() {
    let releases = JSON.parse(
      execSync(`heroku releases --app monsoon-production --json`).toString()
    ) as { description: string; version: number }[]

    releases = this.discardEnvVarUpdates(releases)
    releases = this.handleRollbackIfNeeded(releases)
    releases = this.discardEnvVarUpdates(releases)

    const activeRelease = releases[0]

    const hash = this.extractCommitHash(activeRelease)

    return hash
  }

  private discardEnvVarUpdates = releases => {
    let _releases = cloneDeep(releases)
    let release = _releases.shift()
    while (!!release.description.match(/Set/)) {
      this.checkReleases(_releases)
      release = _releases.shift()
    }
    return [release, ..._releases]
  }

  private handleRollbackIfNeeded = releases => {
    let _releases = cloneDeep(releases)
    let release = _releases.shift()
    if (!!release.description.match(/Rollback/)) {
      const activeVersion = Number(
        release.description.slice(
          // e.g "Rollback to v188" -> 13
          release.description.match(/\d{1,5}$/).index
        )
      )
      while (release.version !== activeVersion) {
        this.checkReleases(_releases)
        release = _releases.shift()
      }
    }
    return [release, ..._releases]
  }

  private checkReleases = releases => {
    if (releases.length === 0) {
      throw new Error(
        "Unable to retrieve latest commit. Please see: https://dashboard.heroku.com/apps/monsoon-production"
      )
    }
  }
  private extractCommitHash = release => {
    // console.log(release)
    const description = release.description
    const hashIndex = description.match(/[0-9a-z]{8}$/).index

    return description.slice(hashIndex)
  }
}
