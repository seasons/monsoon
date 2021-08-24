import "module-alias/register"

import readlineSync from "readline-sync"

import { PrismaService } from "../../prisma/prisma.service"

const duplicates = [
  ["ckpol363f0bi30734yi34tw00", "cklwlvoc21l830786fwtwnpzh"],
  ["ck3t6vbmz1tyj0707eib9w32d", "ckl16svtw2yw70760b621jgjl"],
  ["ck2zecj4z0umr0734g8wxkd8e", "ckngbeixz59k20744qv3yu45t"],
  ["ckokeko1u4g0t0736ik0kq3ir", "ckp8enklj06gw05392fryd6g6"],
  ["ckbtsh3hx9jrf07986sz16400", "ckpcvgl7h001s0507khzq5q8u"],
  ["ckkug87dr0o0p0795y370tptg", "ckhasdqc80yka07586bhb9yh7"],
  ["cka7cxta6db2q0797attttgm0", "cknoz5lzu7sjv0772ki8ow8yp"],
  ["ckpf1t7d64w4w07004pgzmu9m", "ckp34u5f10z1d0575eztaqn87"],
  ["ckn6zu02b2wtw0794pp9je4wb", "ck37o3op70t8f0765pfb6vqvr"],
  ["ckaplhahh5ldd0772vze1zpsr", "cklxf7r7000250779br70m1ib"],
  ["ck8apf7qk5ghc0792vh8j0ury", "ckc0wqedt0itt0797qeio1h8g"],
  ["ck544msbfann80734jnxkzzna", "ck2zduo5i0olf0734cgspq033"],
  ["ck2zed7wr0vqh07342cei48as", "ckojhpd1rcghe0792fkv1v6ay"],
  ["ck2zebegz0svd073430zg6xjr", "ck2zduo5i0olf0734cgspq033"],
  ["ckfoib6pj0bpf07139s92wezr", "ckmn0kl8w00n80770sv9bi2ve"],
  ["ckppvmk5i473r0734l9td5wk1", "ck55h7arz9uxz0704ant5lugf"],
  ["ck6l2gsbnclpa0789ipgeaf3v", "ckkeyduic4wzw0723uwhs6dn3"],
  ["ckpx3g0d83nmt0798j0ici03r", "ckqee2xze0ghy0748ef6izpek"],
  ["ckfxasmgp0sa40798yzzbrilb", "ckq76o3ji12b60743u1q5b3mj"],
  ["ck2zec8pc0u370734ul8qq98x", "ckot0dfze1dxd0567cnxpqg2s"],
  ["ckmxtps8t03fy0704ialblweh", "ckni810f60uw90707ny2hna0e"],
  ["ckh2ig4d81aol07827uqgdcwy", "ckiqzgagv038d0791pfqc2t8c"],
  ["ckovttf661xcc0599mdyuma94", "ckhpjjh7f1dj10772lr1afli4"],
  ["ck8apqzdu6svx0792hwt0e8c9", "ckf8m55go0djz07293k5xt2ps"],
  ["cka7crpttd1u90797awog1pb4", "ck2gmwegw06kf0757letuqnb2"],
  ["ckmcgvcnd490t0738l67tuzg2", "ckfssttdx0hy00728ji9ivv50"],
  ["ckf5tdmuz0bcy0783josh8ca6", "cknpj0fao3noq0798qmmm8439"],
  ["ckoc08q352t1w07101n71h9va", "ckr0n6sum565921yoiyvzl9k5"],
  ["ck3t6vas31txb0707q0hplg7p", "ckknj158j157h07816ss81zw6"],
  ["cki7rilc41qr20759jz00qijh", "ckojhpd1rcghe0792fkv1v6ay"],
  ["ckhdpgdc11b330733bi1patn2", "ckonpfxwv47o6075411e4cv6s"],
  ["ck2zec8tx0u3i0734hgyj0rgl", "ckknuk2px1i7k0781vzb9b2a1"],
  ["cki7qd7cx1mj70759bfqhen1q", "ckm9e9ifq299t076810m7sfrz"],
  ["cka7cshyhd38l07973x6wuvpw", "ckeel7pmt0d7d0793bxsfg95j"],
  ["cka7cryt6d27x0797upj9v0or", "ckeyu5gq00knn0706vzwk4ygl"],
  ["ck2zedcnq0w0v0734omgas441", "ckngbeixz59k20744qv3yu45t"],
  ["ckbtsg4g69jg7079890yu5zga", "ckbo9imijhdlm07198cs9t8b1"],
  ["ckfoir0po0c1z0713s8j65lyc", "ckn0c1qeu4z8a0762m8x51yw0"],
  ["ckm2isqcl1s720787yfg9gbrn", "ckp8enklj06gw05392fryd6g6"],
  ["ckm2i0ktq1ngm0787ama7k4pa", "ck2xh4cwp008a0754gk1nixdg"],
  ["ck3t6p67l1tce07074z3qoluv", "ckg0vk2d213ln0790xn4wfnta"],
  ["ck2zeck5r0uno0734sjfun52o", "ckha44o6g0ow80758in243i0s"],
  ["ck2zebn970tbe0734o5kcszjn", "ckfwr50180wam07552och7ywg"],
  ["cknj89abl5hdk0707owla85ho", "cknb9nkza4has0772etu69tp7"],
  ["ckmclyimy4n5d0738t8g50myf", "cks87ly6p9913102e0e178u759l"],
  ["ck2zebjv60t4z0734pevuwmg9", "ckolq4b5l2456072046nfocas"],
  ["ckf6weit9068h0767kngtyndn", "ckeel7pmt0d7d0793bxsfg95j"],
  ["cke1uom5u19oz0715lsufe4k9", "ckf8m55go0djz07293k5xt2ps"],
  ["ckn96kmyh00740783h6bq85jl", "ckle4d2ah1xyh0718pklatjab"],
  ["ckdgfm9ys107q0767gpuk3tx4", "ck4bp2hb00w650781tej5smsb"],
  ["ck2zec9b40u4f0734qo72jmzr", "ck55h7arz9uxz0704ant5lugf"],
  ["ckkef6q7q1nem0723uhyj9o48", "ckjox8d950t920752zu9yqb3z"],
  ["ckmwdqizt1ofp0789euhs9cap", "ckhnsdq7g0f2o07452hl70719"],
  ["ckg8dc21e0rl20774h5ynui5f", "ckiqzgagv038d0791pfqc2t8c"],
  ["ckmoa5b035l3u07709mev41hd", "ckgcj6bdu0hhb0752mkt93es5"],
  ["ckmwfr08r21xz078955hh7xqv", "ckgqxp4ge0ahs0732nbj06wap"],
  ["ckovttf5d1xc80599odweimm0", "cklraq16y1y6p0787b44f7dpl"],
]
const run = async () => {
  const ps = new PrismaService()

  const numItems = duplicates.length
  let i = 0
  for (const [prodVarId, customerId] of duplicates) {
    const bagItems = await ps.client.bagItem.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        productVariant: { id: prodVarId },
        customer: { id: customerId },
        status: "Added",
      },
      select: {
        saved: true,
        status: true,
        id: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (bagItems.length === 0) {
      continue
    }
    console.log(`${i++} of ${numItems}`)
    console.log(bagItems)
    const shouldProceed = readlineSync.keyInYN("Delete the oldest saved?")

    if (shouldProceed) {
      await ps.client.bagItem.delete({
        where: { id: bagItems.filter(a => a.saved)[0].id },
      })
    }
  }
}
run()
