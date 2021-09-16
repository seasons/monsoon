import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const ps = new PrismaService()

const customersToDeactivate = [
  "ck2yzupyo0bah0734ep3rc29c",
  "ckelyhkl101uw07954whk605a",
  "ckfw442ck07x40755rmuvxmb4",
  "ckg87aob70i6p07742wnu445l",
  "ckgbb2w9910lu0750hljkc3n7",
  "ckhw4voqm2n7j07122gejt3cu",
  "ckjkae9fj0bew0739r0u09q98",
  "ckkpnfown3ayo0759rzu0bbb4",
  "ckkptfaev086c07835xu9r0zd",
  "ckkpu4p1w0bfp0783mrfags8d",
  "ckkq482zo1u6g0783yw9pgczq",
  "ckli7j1tt1y050714mewht8jf",
  "cknt80i0q06y20727qp2314u7",
  "cksetm5dn771562fyiinhaxtcg",
  "cksett1un1089052fyijxzrqpex",
  "cksevom31569022frlix2g056o",
  "cksg6lmgb11977602fw1nzsb8kdb",
  "ckha44o6g0ow80758in243i0s",
  "ck2zduo5i0olf0734cgspq033",
  "ckm8rxmug1iaw0768t9odgiaa",
  "cki7o8qbb1jbz07597h5yq90x",
  "cko66moq100bv0737t11er8gm",
  "cki2dx6f30ca00706n5rx5456",
  "ckhvzn63c2as60712dfs9d5kc",
  "ckhz8ep5428mb07376jqv81zs",
  "ckezzcmw6042207170bnliovx",
  "ck90cj9ys7ym90721y173uae6",
  "ck2nei83d003z0726k2cqtqp9",
  "ckjup2qia1kdf07389sgckvwb",
  "ck68cztprkslv0777oze8hb84",
  "ck6i97zone6w507702zs4d3z5",
  "ck6f6twz7b4d50712vwqrp3xh",
  "ck70qzvbrtcjw0776mmhndsp8",
  "ck7azy25j1a1s0734890gv3tn",
  "ck69p5ydrh42f078503yxxj1t",
  "ck7nqhm92v4mj0708g656zdbj",
  "ck7c7ztgdzacx0770v4vpwfva",
  "ck5q41kcihrua0742xsga0v8g",
  "ckd3zkvtf0ci40717qr8keone",
  "ckmqex5970x320788jukavxsj",
  "ckeiwq0j705110731h0yn5hma",
  "ckeya8vyx06dj0706its8etjo",
  "ckokyilc78alg0736l2pla3he",
  "ckhwpq3kt163g0746g2ryeq1a",
  "ckojk2murgtww0792fmncck21",
  "ckpotqtxa0whj0734o3icke5d",
  "ckhybpwyb0yio0737xhtcw6u0",
  "ckohyo9864fci0776wwag5cpc",
  "ckpa8dmxl0b9b0572om5yhquw",
  "cksnrwza96739132hwb8by21kqc",
  "ckrugkz0p479131jx9e41kjhuc",
  "ckog3hyf4cihn074049jz7ga9",
  "cks855jx78583532e0e5hy14wtj",
  "ckdajiyjz1i6l076001fos6jl",
  "ckr9itthm160403621z4jmng85c2",
]

const deactivateSeasonsTestAccounts = async () => {
  await ps.client.customer.updateMany({
    where: { id: { in: customersToDeactivate } },
    data: { status: "Deactivated" },
  })
  console.log("deactivated")
}

// ALREADY RAN:
deactivateSeasonsTestAccounts()

/*
~ 57 customers with status "Active" in prisma but a cancelled subscription in Chargebee.
17 of them were @seasons.nyc emails. They were marked as "Deactivated"
*/
