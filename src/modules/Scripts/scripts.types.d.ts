import { CommandOptionsOption } from "nestjs-command"
import { ModuleRef } from "@nestjs/core"

export interface MonsoonCommandOptions
  extends Omit<CommandOptionsOption, "name"> {
  describeExtra?: string
}

export interface UpdateEnvironmentInputs {
  prismaEnv: PrismaEnvironmentSetting
  airtableEnv?: AirtableEnvironmentSetting
}

export interface UpdateConnectionsInputs extends UpdateEnvironmentInputs {
  moduleRef: ModuleRef
}

export type PrismaEnvironmentSetting = "local" | "staging" | string
export type AirtableEnvironmentSetting = "staging" | "production" | string
