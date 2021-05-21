import "module-alias/register"

import * as util from "util"

import zipcodes from "zipcodes"

import { DripService } from "../../modules/Drip/services/drip.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  // const c = await ps.binding.query.categories(
  //   { where: { name: "Tops" } },
  //   `{
  //     id
  //     name
  //     children {
  //       id
  //       name
  //     }
  // }`
  // )
  const c = await ps.client.categories({
    where: { children_some: { name: "Tees" } },
  })
  console.log(util.inspect(c, { depth: null }))
}
run()
