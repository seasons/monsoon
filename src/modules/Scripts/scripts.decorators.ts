import { Option } from "nestjs-command"

import { MonsoonCommandOptions } from "./scripts.types"

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

export const EmailOption = ({
  describeExtra = "",
  ...options
}: MonsoonCommandOptions = {}) =>
  Option({
    name: "email",
    describe: `Email of the new user. ${describeExtra}`,
    type: "string",
    alias: "em",
    ...options,
  })

export const PasswordOption = ({
  describeExtra = "",
  ...options
}: MonsoonCommandOptions = {}) =>
  Option({
    name: "password",
    describe: `Password of the new user. ${describeExtra}`,
    type: "string",
    alias: "pw",
    ...options,
  })
