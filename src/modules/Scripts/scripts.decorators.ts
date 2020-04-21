import { MonsoonCommandOptions } from "./scripts.types"
import { Option } from "nestjs-command"

export const PrismaEnvOption = ({
  choices = ["local", "staging"],
  // use "defaultChoice" because "default" is a reserved word and therefore can not be used as a parameter
  default: defaultChoice = "local",
  describeExtra = "",
  ...options
}: MonsoonCommandOptions = {}) =>
  Option({
    name: "prisma",
    describe: `Prisma environment command runs against. ${describeExtra}`,
    choices,
    type: "string",
    default: defaultChoice,
    alias: "pe",
    ...options,
  })

export const AirtableEnvOption = ({
  choices = ["local", "staging"],
  // use "defaultChoice" because "default" is a reserved word and therefore can not be used as a parameter
  default: defaultChoice = "staging",
  describeExtra = "",
  ...options
}: MonsoonCommandOptions = {}) =>
  Option({
    name: "airtableEnv",
    alias: "ae",
    describe: `Airtable environment command runs against. ${describeExtra}`,
    choices,
    type: "string",
    default: defaultChoice,
    ...options,
  })

export const AirtableIdOption = ({
  describeExtra = "",
  ...options
}: MonsoonCommandOptions = {}) =>
  Option({
    name: "airtableId",
    alias: "abid",
    describe: `Airtable database command runs against. ${describeExtra}`,
    type: "string",
    ...options,
  })
