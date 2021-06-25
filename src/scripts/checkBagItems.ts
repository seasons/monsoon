import "module-alias/register"

import * as util from "util"

import zipcodes from "zipcodes"

import { DripService } from "../modules/Drip/services/drip.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

const bagItems = [
  //   "ckojo3s14llti07922567tymm",

  //   "ckojo496pllzq0792tli3h4hp",

  //   "ckojo5xx8lmh80792cu32v93d",

  //   "ckojocbenlqcy07926hdon4a5",

  //   "ckojocobilqur0792232je2dr",

  //   "ckojofos7lsxp07929lnkowpk",

  //   "ckojofv0hlt0z0792bqucqois",

  //   "ckojohsgoluzi079230xbnibt",

  //   "ckojojbd0lvsm07921lzdei99",

  //   "ckojojteklwa80792dqwz21gh",

  //   "ckojokx2jlxmc0792y8p1qckw",

  //   "ckok5j1ac1fr90736kf6ydh0a",

  //   "ckok5kdcx1gfj0736o5fxqc3r",

  //   "ckokt34al7hm507369v9od2r8",

  //   "ckp3b3tf400b40512xb24k86q",

  //   "ckp71dktp0abl0501jdcseuv8",

  //   "ckp71fe0c0c9a0546vs25i636",

  //   "ckplntrfv022s0722nf84kg3a", 18

  //   "ckplnwdqa02ia07221iku9zzq",

  //   "ckplnxbcf02ti0722x8b9b304",

  "ckpsoou6g3vbh07273zjbjbrt",

  //   "ckpsorl0x3vvi07271cb7ry2g",

  //   "ckpsou2aa3w9f0727k1q0ubsx",

  //   "ckpwvm9ix2hbl07980p27ww9b",

  //   "ckpwvp57w2hwh0798p7c2mgbd",

  //   "ckpyvqbpa67tb075825uthqvc",

  //   "ckpyvrwqn680t07586cwykiuz",

  //   "ckpyw12ly68r907589eoadpnl",

  //   "ckpyw3u0j690j0758v8v2ue5k",
]

const run = async () => {
  const ps = new PrismaService()

  let count = 0
  for (const id of bagItems) {
    count++
    try {
      console.log("count", count)
      ps.binding.query.bagItem(
        { where: { id } },
        `{
              id
              productVariant {
                  id
                }
          }`
      )
    } catch (e) {
      console.log("id", id, " / ", e)
    }
  }
}
run()
