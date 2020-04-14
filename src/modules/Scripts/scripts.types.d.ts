import { ModuleRef } from "@nestjs/core"

export interface UpdateEnvironmentInputs {
  prisma: PrismaEnvironmentSetting
  airtable?: AirtableEnvironmentSetting
}

export interface UpdateConnectionsInputs extends UpdateEnvironmentInputs {
  moduleRef: ModuleRef
}

export type PrismaEnvironmentSetting = "local" | "staging" | string
export type AirtableEnvironmentSetting = "staging" | "production" | string
