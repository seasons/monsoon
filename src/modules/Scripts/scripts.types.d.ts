import { ModuleRef } from "@nestjs/core"
import { CommandOptionsOption } from "nestjs-command"

export interface MonsoonCommandOptions
  extends Omit<CommandOptionsOption, "name"> {
  name?: string
  describeExtra?: string
}

export interface UpdateEnvironmentInputs {
  prismaEnv: PrismaEnvironmentSetting
  dripEnv?: "staging" | "production"
}

export interface UpdateConnectionsInputs extends UpdateEnvironmentInputs {
  moduleRef: ModuleRef
}

export type PrismaEnvironmentSetting = "local" | "staging" | string
