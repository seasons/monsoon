import "module-alias/register"

import { format } from "path"

import chargebee from "chargebee"
import { groupBy, orderBy, uniq } from "lodash"

import { GRANDFATHERED_PLAN_IDS } from "../modules/Payment/services/subscription.service"
import { TimeUtilsService } from "../modules/Utils/services/time.service"
import { PrismaService } from "../prisma/prisma.service"

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const handle = (err, result) => {
  if (err) {
    return err
  }
  if (result) {
    return result
  }
}

const run = async () => {
  const ps = new PrismaService()
  const timeUtils = new TimeUtilsService()

  const allPromotionalCredits = []
  let offset = "start"
  while (true) {
    sleep(500)
    let list
    ;({ next_offset: offset, list } = await chargebee.promotional_credit
      .list({
        limit: 100,
        // "customer_id[is]": "ckp7gh0if17wv0546azukj783",
        ...(offset === "start" ? {} : { offset }),
      })
      .request())
    allPromotionalCredits.push(...list?.map(a => a.promotional_credit))
    if (!offset) {
      break
    }
  }

  const allInvoices = []
  offset = "start"
  while (true) {
    sleep(500)
    let list
    ;({ next_offset: offset, list } = await chargebee.invoice
      .list({
        limit: 100,
        // "customer_id[is]": "ckp7gh0if17wv0546azukj783",
        ...(offset === "start" ? {} : { offset }),
      })
      .request())
    allInvoices.push(...list?.map(a => a.invoice))
    if (!offset) {
      break
    }
  }

  const creditsGroupedByChargebeeCustomerId = groupBy(
    allPromotionalCredits,
    a => a.customer_id
  )
  const invoicesGroupedByChargebeeCustomerId = groupBy(
    allInvoices,
    a => a.customer_id
  )

  // SPECIFIC FLAGS

  const specificFlags = await processSpecificFlags(
    ps,
    timeUtils,
    creditsGroupedByChargebeeCustomerId,
    invoicesGroupedByChargebeeCustomerId
  )

  console.log("\n\n")
  const generalFlags = await calculateProperPromotionalCreditBalanceForAllCustomers(
    ps,
    timeUtils,
    creditsGroupedByChargebeeCustomerId,
    invoicesGroupedByChargebeeCustomerId
  )
  // const generalFlags = []

  const allFlags = [...specificFlags, ...generalFlags]
  await printFlags(allFlags, {
    ps,
    timeUtils,
    creditsGroupedByChargebeeCustomerId,
    invoicesGroupedByChargebeeCustomerId,
  })
  console.log(` **** AUDIT DONE ****`)
}

const calculateProperPromotionalCreditBalanceForAllCustomers = async (
  ps: PrismaService,
  timeUtils: TimeUtilsService,
  creditsGroupedByChargebeeCustomerId,
  invoicesGroupedByChargebeeCustomerId
) => {
  const userIdsWithCreditHistoryOnChargebee = Object.keys(
    creditsGroupedByChargebeeCustomerId
  )
  const allRelevantCustomers = await ps.client.customer.findMany({
    where: {
      OR: [
        { status: { in: ["Active", "PaymentFailed", "Deactivated"] } },
        { user: { id: { in: userIdsWithCreditHistoryOnChargebee } } },
        { membership: { creditBalance: { gt: 0 } } },
      ],
      // user: { id: "ckp7gh0if17wv0546azukj783" },
    },
    select: {
      user: { select: { id: true } },
      membership: { select: { creditBalance: true } },
    },
  })

  const allChargebeeCustomers = []
  let offset = "start"
  while (true) {
    sleep(500)
    let list
    ;({ next_offset: offset, list } = await chargebee.customer
      .list({
        limit: 100,
        // "customer_id[is]": "ckp7gh0if17wv0546azukj783",
        ...(offset === "start" ? {} : { offset }),
      })
      .request())
    allChargebeeCustomers.push(...list?.map(a => a.customer))
    if (!offset) {
      break
    }
  }
  const flags = []
  for (const cust of allRelevantCustomers) {
    const chargebeeCustomer = allChargebeeCustomers.find(
      a => a.id === cust.user.id
    )
    const invoices = invoicesGroupedByChargebeeCustomerId[cust.user.id]
    if (!chargebeeCustomer) {
      continue
    }

    // Calculate proper promotional credit balance
    const chargebeeCreditLogs =
      creditsGroupedByChargebeeCustomerId[cust.user.id]
    if (
      !chargebeeCreditLogs &&
      cust.membership.creditBalance === 0 &&
      chargebeeCustomer.promotional_credits === 0
    ) {
      continue
    }

    if (
      chargebeeCustomer.promotional_credits !== 0 &&
      chargebeeCustomer.unbilled_charges === 0
    ) {
      flags.push({
        failureMode:
          "Nonzero promotional credit balance with no upcoming charges",
        id: cust.user.id,
      })
      continue
    }

    // Does not include membership renewal-based promotional credits
    const mostValidCreditsCreatedOnChargebee =
      getValidNonMembeshipRenewalCreditCreationLogs(
        chargebeeCreditLogs
      )?.reduce((acc, curval) => Math.round(curval.amount + acc), 0) || 0
    const membeshipRenewalPromotionalCredits = Math.round(
      getMembershipRenewalCreditCreations(invoices, timeUtils).reduce(
        (acc, curval) =>
          acc +
          curval.line_items.find(b =>
            GRANDFATHERED_PLAN_IDS.includes(b.entity_id)
          ).amount *
            1.15,
        0
      )
    )
    const totalCreditsAppliedTowardsInvoices =
      getValidCreditUsageLogs(chargebeeCreditLogs)?.reduce(
        (acc, curval) => acc + curval.amount,
        0
      ) || 0
    const totalCreditsCreated = Math.round(
      membeshipRenewalPromotionalCredits + mostValidCreditsCreatedOnChargebee
    )
    const expectedCredits =
      totalCreditsCreated - totalCreditsAppliedTowardsInvoices
    if (expectedCredits !== cust.membership.creditBalance) {
      flags.push({
        failureMode:
          "Current credit balance not equal to expected credit balance",
        id: cust.user.id,
        // meta: {
        //   totalCreditsCreated,
        //   membeshipRenewalPromotionalCredits: Math.round(
        //     membeshipRenewalPromotionalCredits
        //   ),
        //   membershipRenewalCreditsMetadata,
        //   mostValidCreditsCreatedOnChargebee,
        //   expectedCredits,
        //   totalCreditsAppliedTowardsInvoices,
        //   creditBalance: cust.membership.creditBalance,
        // },
      })
      continue
    }
  }

  return flags
}

const processSpecificFlags = async (
  ps,
  timeUtils,
  creditsGroupedByChargebeeCustomerId,
  invoicesGroupedByChargebeeCustomerId
) => {
  const flags = []
  for (const chargebeeCustomerId of Object.keys(
    creditsGroupedByChargebeeCustomerId
  )) {
    const credits = creditsGroupedByChargebeeCustomerId[chargebeeCustomerId]
    const sortedCredits = orderBy(credits, ["created_at", "desc"])
    const sortedCreditDescriptions = sortedCredits.map(a => a.description)
    const invoices = invoicesGroupedByChargebeeCustomerId[chargebeeCustomerId]

    // If we moved rental charge credits back to prisma before they had a chance to get applied, flag it
    const automaticMoveLogIndex = sortedCredits.findIndex(a =>
      a.description.includes("Automatically move to internal system")
    )
    if (automaticMoveLogIndex > 0) {
      const logBeforeAutomaticMove = sortedCredits[automaticMoveLogIndex - 1]
      if (logBeforeAutomaticMove.description.includes("rental charges")) {
        flags.push({
          failureMode: "Automatically moved rental credits",
          id: chargebeeCustomerId,
        })
        continue
      }
    }

    // flag if a grandfathered customer had promo credits apply towards a membership due
    const receivedInitialCredits = sortedCredits.some(a =>
      a.description.includes("Initial grandfathering")
    )
    const invoicesWithCreditsAppliedTowardGrandfatheredPlan = getInvoicesWithCreditsAppliedTowardGrandfatheredPlan(
      invoices,
      timeUtils
    )
    if (
      receivedInitialCredits &&
      invoicesWithCreditsAppliedTowardGrandfatheredPlan.length > 0
    ) {
      flags.push({
        failureMode: "Applied credits to a grandfathered plan charge",
        id: chargebeeCustomerId,
        // meta: { invoicesWithCreditsAppliedTowardGrandfatheredPlan },
      })
      continue
    }

    // If the credit is too large, flag it
    // Inspied by Justin P Olivierre, who received a $1160 credit: https://seasons.chargebee.com/customers/14345261/details#promotional-credits
    // We choose 27814 as the threshold because the highest known "expected" credit to be added is 27814, in response to an essential-6 charge
    if (sortedCredits.some(a => a.type === "increment" && a.amount > 27814)) {
      flags.push({
        failureMode: "Excessive credit added",
        id: chargebeeCustomerId,
      })
      continue
    }

    // Flag: Received initial credits but then switched to an access plan before 10.01.
    // Most likely had duplicate credits.
    const movedToAccessPlanBeforeOctoberFirst = invoices.some(a => {
      const chargeDate = timeUtils.dateFromUTCTimestamp(a.date, "seconds")
      const beforeOctoberFirst = timeUtils.isLaterDate(
        new Date(2021, 9, 2),
        chargeDate
      )
      const hasAccessCharge = a.line_items.some(
        a =>
          a.description.includes("Access Monthly") ||
          a.description.includes("Access Yearly")
      )
      return beforeOctoberFirst && hasAccessCharge
    })
    if (receivedInitialCredits && movedToAccessPlanBeforeOctoberFirst) {
      flags.push({
        failureMode:
          "Grandfathered but moved to access plan before October 1st",
        id: chargebeeCustomerId,
      })
      continue
    }

    // Flag: Switched to access-yearly and received undue credits
    const undueAccessYearlyCredits = sortedCredits.some(
      a =>
        a.description.includes("Grandfathered access-yearly credits") &&
        a.amount === 22425
    )
    if (undueAccessYearlyCredits) {
      flags.push({
        failureMode: "Given promotional credits for access yearly charge",
        id: chargebeeCustomerId,
      })
      continue
    }

    // Flag: Switched to access-yearly and received undue credits
    const undueAccessMonthlyCredits = sortedCredits.some(
      a =>
        a.description.includes("Grandfathered access-monthly credits") &&
        a.amount === 2300
    )
    if (undueAccessMonthlyCredits) {
      flags.push({
        failureMode: "Given promotional credits for access monthly charge",
        id: chargebeeCustomerId,
      })
      continue
    }

    // If total credits created is less than total credits deducated on chargebee,
    // flag
    const totalValidCreditsCreatedOnChargebee = credits
      .filter(a => a.type === "increment")
      .filter(a => {
        const initialCreditCreation = a.description.includes(
          "Initial grandfathering"
        )
        const subscriptionDueCreditCreation =
          a.description.includes("Grandfathered") &&
          a.description.includes("credits") &&
          !a.description.includes("access-monthly") &&
          !a.description.includes("access-yearly")
        const teamMemberAddedIt = a.done_by?.includes("seasons.nyc")
        const createdDuringReturn = a.description.includes(
          "Returned while deleting the invoice"
        )
        const createdDuringCreditNote = a.description.includes(
          "Returned while creating the Credit Note"
        )
        return (
          initialCreditCreation ||
          subscriptionDueCreditCreation ||
          createdDuringReturn ||
          createdDuringCreditNote ||
          teamMemberAddedIt
        )
      })
      .reduce((acc, curval) => curval.amount + acc, 0)

    const validUsageLogs = getValidCreditUsageLogs(credits)
    const totalCreditsDeductedOnChargebee = validUsageLogs.reduce(
      (acc, curval) => curval.amount + acc,
      0
    )

    if (totalValidCreditsCreatedOnChargebee < totalCreditsDeductedOnChargebee) {
      flags.push({
        failureMode: "More credits deducted than created",
        id: chargebeeCustomerId,
      })
      continue
    }

    // flag if two descriptions in a row are the same
    let lastDescription = null
    for (const description of sortedCreditDescriptions) {
      if (
        description
          .toLowerCase()
          .includes("grandfathered access-yearly credits") ||
        description
          .toLowerCase()
          .includes("grandfathered access-monthly credits")
      ) {
        flags.push({
          failureMode: "Credits may have been given to access customer",
          id: chargebeeCustomerId,
        })
        break
      }

      if (lastDescription === description) {
        flags.push({
          failureMode: "Credits may have been given to access customer",
          id: chargebeeCustomerId,
        })
        break
      } else {
        lastDescription = description
      }
    }
  }

  return flags
}
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const getCorrectCreditCreationHistory = (
  chargebeeCustomerId,
  timeUtils: TimeUtilsService,
  creditsGroupedByChargebeeCustomerId,
  invoicesGroupedByChargebeeCustomerId
) => {
  const chargebeeCreditLogs =
    creditsGroupedByChargebeeCustomerId[chargebeeCustomerId]
  const validNonMembershipRenewalCreditCreationlogs = getValidNonMembeshipRenewalCreditCreationLogs(
    chargebeeCreditLogs
  )
  const formattedValidNonMembershipRenewalCreditCreationlogs = validNonMembershipRenewalCreditCreationlogs.map(
    a => ({
      date: timeUtils.dateFromUTCTimestamp(a.created_at, "seconds"),
      amount: Math.round(a.amount),
      description: a.description,
    })
  )

  const invoices = invoicesGroupedByChargebeeCustomerId[chargebeeCustomerId]
  const membershipRenewalCreditCreations = getMembershipRenewalCreditCreations(
    invoices,
    timeUtils
  )
  const formattedMembershipRenewalCreditCreations = membershipRenewalCreditCreations.map(
    a => {
      const grandfatheredPlanCharge = a.line_items.find(b =>
        GRANDFATHERED_PLAN_IDS.includes(b.entity_id)
      )
      return {
        date: timeUtils.dateFromUTCTimestamp(a.date, "seconds"),
        amount: grandfatheredPlanCharge.amount * 1.15,
        description: `${grandfatheredPlanCharge.entity_id} Membership Renewal`,
      }
    }
  )

  const sortedCreditCreations = orderBy(
    [
      ...formattedMembershipRenewalCreditCreations,
      ...formattedValidNonMembershipRenewalCreditCreationlogs,
    ],
    ["date", "asc"]
  )
  return sortedCreditCreations
}

const getCorrectCreditUsageHistory = (
  chargebeeCustomerId,
  timeUtils,
  creditsGroupedByChargebeeCustomerId,
  invoicesGroupedByChargebeeCustomerId
) => {
  const creditLogs = creditsGroupedByChargebeeCustomerId[chargebeeCustomerId]
  const invoices = invoicesGroupedByChargebeeCustomerId[chargebeeCustomerId]
  const validUsageLogs = getValidCreditUsageLogs(creditLogs)

  const formattedLogs = validUsageLogs
    .map(a => {
      // const invoiceId = a.description.slice(-4)
      // const invoice = invoices.find(a => a.id === invoiceId)
      // const creditsErroneouslyApplied = getAmountIncorrectlyCreditedTowardGrandfatheredPlanCharge(
      //   invoice
      // )
      return {
        date: timeUtils.dateFromUTCTimestamp(a.created_at, "seconds"),
        amount: Math.round(a.amount),
        description: a.description,
      }
    })
    .filter(a => a.amount > 0)
  const sortedLogs = orderBy(formattedLogs, ["date", "asc"])
  return sortedLogs
}

const getValidCreditUsageLogs = chargebeeLogs =>
  chargebeeLogs
    ?.filter(a => a.type === "decrement")
    ?.filter(b => {
      return b.description.includes("Applied to the invoice")
    }) || []

const getValidNonMembeshipRenewalCreditCreationLogs = chargebeeLogs => {
  return (
    chargebeeLogs
      ?.filter(a => a.type === "increment")
      ?.filter(a => {
        const initialCreditCreation = a.description.includes(
          "Initial grandfathering"
        )
        const teamMemberAddedIt = a.done_by?.includes("seasons.nyc")
        const createdDuringReturn = a.description.includes(
          "Returned while deleting the invoice"
        )
        const createdDuringCreditNote = a.description.includes(
          "Returned while creating the Credit Note"
        )
        const isValid =
          initialCreditCreation ||
          createdDuringReturn ||
          createdDuringCreditNote ||
          teamMemberAddedIt
        return isValid
      }) || []
  )
}

const getMembershipRenewalCreditCreations = (invoices, timeUtils) => {
  return invoices.filter(curval => {
    const chargeDate = timeUtils.dateFromUTCTimestamp(curval.date, "seconds")
    const isAfterSeptemberTwenty = timeUtils.isLaterDate(
      chargeDate,
      new Date(2021, 8, 20)
    )
    if (!isAfterSeptemberTwenty) {
      return false
    }
    if (curval.status !== "paid") {
      return false
    }
    const grandfatheredPlanCharge = curval.line_items.find(a =>
      GRANDFATHERED_PLAN_IDS.includes(a.entity_id)
    )
    return !!grandfatheredPlanCharge
  })
}

const printFlags = async (
  flags,
  {
    ps,
    timeUtils,
    creditsGroupedByChargebeeCustomerId,
    invoicesGroupedByChargebeeCustomerId,
  }: {
    ps: PrismaService
    timeUtils: TimeUtilsService
    creditsGroupedByChargebeeCustomerId: any
    invoicesGroupedByChargebeeCustomerId: any
  }
) => {
  const uniqueFlags = uniq(flags, a => a.id)
  const reconciled = [
    "ckoxwxih404yp0544brb8xgs1", // Lamarr Nanton
    "cksq66als339522fwvbhchva94",
    "ck68f2mxrltgl0777a3vnfx8z",
    "ck8p84yrm12dz07230kyeggwq",
    "ckcqloze31z8u0702190vtm9t", // Daniel Pollis.
    "cki6z6sjq17jk0759vh9qlrto", // Luke Rivera
    "ckq65me7k2cak0701xumuesf8", // Ujjwal Gupta
    "ckhpn3z4m2ai20772ee2biy3f", // Chima Acholonu
    "ckkne2e2d0mka0781xu1c22yx", // Robert Mckinley
    "ck7ow1pyx058o0732ag31h6f2", // Robert Kelly
    "ckjt4s4qh0s6a0729i6rnu1hz", // Krischan Singh
    "ck68fll2tm2o207775mbenhrn", // Justin P Ollivierre
    "ck576lgrie73407346ff3u2p7", // Adam Fraser
    "ckufsl3qz15260872eri8jny9j3o", // Marc Asuncion
    "ckp06r4cb0oki05969f2m843m", // Ross Mcleod
    "ckjuwd0go2pqh0738huttrfez", // Noah Schriefer
    "ckhw78f7t31y10712i34bv5y6", // Freddy Carbajal
    "ckolp71vl1uvf0720o5150qsm", // Scott Baretta
    "ck6u4se7gjq6l07323meaiypx", // Nick Bognar
    "cks51jooq2590392e06vhias58x", // Ausar Mundra
    "ckm9e9i9n298x0768by24ektx", // Pawel Wronowski
    "ck30r7rw2043f0797orhjs8me", // Ankit Vij
    "ckge5lxmd0gax0718iloxyoht", // Zeff Zenarosa
    "ckghedkkh0ax70773rqr0dvb7", // Jeremy Leung
    "ckknj14uv15610781wrfk109m", // Jerin Varghese"
    "ckhpk6xpc1qet07729p88svng", // Dale Stephensredit Usage History
    "ckh1fn5db04s107823ugb9ae8",
    "ckgiijpvx16kj07732mrx2qxr",
    "ck386iul21mc90765tfo7i64j",
    "ck2zsdm7p01k307481ax71xmr",
    "ckf8meide0e5k0729p5tvrtvy",
    "ckezzcmki04170717s8mdjcvl",
    "ckqee2xws0gh20748hnuzdn04", // Steve Wernecke
    "ckp69hkws1f1d0596zdr0esjr", // Zachary Gobst
    "ckhpqskia2p1m0772khe7izf7", // Christopher Egwuatu
    "ck2zgc11k12ah073432oz41b6", // Steve Jang
    "ckp7gh0if17wv0546azukj783", // Michael Berger
    "ckstgi9es10627912f1k4ozdc8u2", // Martys Smith
    "cksdmtn5i1382622eu335p09r2b", // Peter Smith
    "ckqe4gxco04qo074835ik8ych", // Matthew Neal
    "ckjvof9x103p10715wv8kb03h", // Steven Almeas
    "ckk03lh0o0mtm07666lplhgyb", // Michael Morado
    "ckdqrhyhl1hf40751q77husqy", // Dustin Zuber
    "cki0jre9j1nhu07858o8nxg6u", // Maryah Greene
    "cke4gnnde182r0741dy126ka7", // Craig Brown
    "cki3cnvai1j860706v1kgkpuz", // Sade Young
    "ckmqaw4jv0if90788ybyrn55b", // Jared Hirsh
    "cksotj9f64427572eyl1n4bu21k", // Griffin Corbin
    "ckhy1fmdm0b5z0737qfa5hwxl", // Harden Kernoodle
    "ckt7h9lke8347012ev7gsubfxzj", // Shadi Jurdi
    "cktnpu66w3927232hwwg9uq27ag", // Lui X
    "ckti1z24j4428652ful9ytmryig", // Conor Holihan
    "ckt010fhy2041072e46chnoxz60", // Samuel Light
    "cktxinqwu6166452gzygq8uz307", // Rahem Batts
    "cknypeyfw1q160711x5nd31u4", // Michael Morikawa
    "ckhpjjh2c1di4077240dqhoqa", // Kunaal Ary
    "ckms18v0213on07793g9tw4ix", // Jen Astrup
    "cko29es0w5l7j0758mbztzw06", // David Guzman
    "ckol8nny0004q0722supb4glo", // Joseph Medina
    "ckorccnk905sz05981mhi3bwy", // Diego Frausto
    "ckovi9btj076p0559kpdq5tcx", // Jonathan Gold
    "ckp5uc6dw0qrb0508unludox2", // Jason Lundy
    "ckp70vndj00210508ehfeh6ic", // Andrew Goh
    "ckphkl2nm1dd80743beapdniq", // Dean Dalmacio
    "ckppqxasl3f1p07348d8rxg6s", // Jorge Guiza
    "ckqj0h6f223r40732744blspp", // Steve Test
    "ckqxxzwrs164558622vz6i6j8nct", // Brent Elrod
    "ckr2z329j6939682uoltpbfal50", // Derek Wright
    "ckjz3w2cg389907471a2wcdnd", // Oren Schauble
    "ckodazw0516mq0710twve1mo0", // John Sese
    "cksls2r3q2862212fvuvzn2d2rk", // Dean Daneluzzi
  ]
  const inProcess = [
    "cksrs1j3n13574712fty3eyx01fm", // Thomas Doe
    "ckbnyur5b5eud0719qqol2pu2", // Abael Solomon
  ]

  const filteredUniqueFlags = uniqueFlags
    .filter(a => !reconciled.includes(a.id))
    .filter(b => !inProcess.includes(b.id))

  console.log(`*** TOTAL UNIQUE FLAGS : ${filteredUniqueFlags.length} ***\n`)
  const filteredFlagsByReason = groupBy(filteredUniqueFlags, a => a.failureMode)
  for (const failureMode of Object.keys(filteredFlagsByReason)) {
    console.log(
      `-- ** ${failureMode}: ${
        filteredFlagsByReason[failureMode]?.length || 0
      } ** -- `
    )
    for (const flag of filteredFlagsByReason[failureMode]) {
      try {
        const prismaUser = await ps.client.user.findUnique({
          where: { id: flag.id },
          select: {
            email: true,
            firstName: true,
            lastName: true,
            customer: {
              select: {
                id: true,
                membership: { select: { creditBalance: true } },
              },
            },
          },
        })
        const creditCreationhistory = getCorrectCreditCreationHistory(
          flag.id,
          timeUtils,
          creditsGroupedByChargebeeCustomerId,
          invoicesGroupedByChargebeeCustomerId
        )
        const creditUsageHistory = getCorrectCreditUsageHistory(
          flag.id,
          timeUtils,
          creditsGroupedByChargebeeCustomerId,
          invoicesGroupedByChargebeeCustomerId
        )
        console.log(`${prismaUser.firstName} ${prismaUser.lastName}\n`)
        console.log(
          `Chargebee Link: https://seasons.chargebee.com/customers?view_code=all&Customers.search=${flag.id}`
        )
        console.log(
          `Admin Link: https://admin.seasons.nyc/members/${prismaUser.customer.id}/account\n`
        )
        console.log(`*Credit Creation History*`)
        for (const event of creditCreationhistory) {
          console.log(
            `${event.date.toLocaleDateString("en-US")}: ${formatPrice(
              event.amount
            )} -- ${event.description}`
          )
        }
        const totalCreated = creditCreationhistory.reduce(
          (acc, curval) => acc + curval.amount,
          0
        )
        console.log(`**Total Created: ${formatPrice(totalCreated)}**\n`)
        console.log(
          `*Credit Usage History*${creditUsageHistory.length === 0 ? "\n" : ""}`
        )
        for (const event of creditUsageHistory) {
          console.log(
            `${event.date.toLocaleDateString("en-US")} -- ${formatPrice(
              event.amount
            )} -- ${event.description}`
          )
        }
        const totalUsage = creditUsageHistory.reduce(
          (acc, curval) => acc + curval.amount,
          0
        )
        console.log(
          `**Total Usage: ${totalUsage > 0 ? "-" : ""}${formatPrice(
            totalUsage
          )}**\n`
        )
        const presentChargebeeBalance = getPresentChargebeeCreditBalance(
          creditsGroupedByChargebeeCustomerId,
          flag.id
        )
        const invoicesWithCreditsAppliedTowardGrandfatheredPlan = getInvoicesWithCreditsAppliedTowardGrandfatheredPlan(
          invoicesGroupedByChargebeeCustomerId[flag.id],
          timeUtils
        )
        const totalCreditsWeNeverShouldHaveCreated = invoicesWithCreditsAppliedTowardGrandfatheredPlan.reduce(
          (acc, curval) => {
            const creditsErroneouslyApplied = getAmountIncorrectlyCreditedTowardGrandfatheredPlanCharge(
              curval
            )
            return acc + creditsErroneouslyApplied * 1.15
          },
          0
        )
        const adjustedTotal =
          totalCreated - totalUsage - totalCreditsWeNeverShouldHaveCreated
        const nonAdjustedTotal = totalCreated - totalUsage
        const adjustmentDetail =
          adjustedTotal !== nonAdjustedTotal
            ? `(${formatPrice(nonAdjustedTotal)}- ${formatPrice(
                totalCreditsWeNeverShouldHaveCreated
              )} for credits erroneously given towards membership dues)`
            : ""
        console.log(
          `**Total Expected: ${formatPrice(
            adjustedTotal
          )} ${adjustmentDetail}**\n`
        )
        console.log(
          `**Total Present: Chargebee ${formatPrice(
            presentChargebeeBalance
          )}, Prisma ${formatPrice(
            prismaUser.customer.membership?.creditBalance
          )}**\n`
        )

        if (invoicesWithCreditsAppliedTowardGrandfatheredPlan.length > 0) {
          console.log(
            `*Invoices with Credits applied toward grandfathered plan charge*`
          )
          for (const problematicInvoice of invoicesWithCreditsAppliedTowardGrandfatheredPlan) {
            const creditsErroneouslyApplied = getAmountIncorrectlyCreditedTowardGrandfatheredPlanCharge(
              problematicInvoice
            )
            console.log(
              `Invoice ${problematicInvoice.id}: ${formatPrice(
                creditsErroneouslyApplied
              )}. https://seasons.chargebee.com/d/invoices/${
                problematicInvoice.id
              }`
            )
          }
        }
        const erroneousTransfer = getErroneousAutomaticCreditsMoveInfo(
          creditsGroupedByChargebeeCustomerId,
          flag.id
        )
        if (!!erroneousTransfer) {
          console.log(
            `\nErroneously moved back ${formatPrice(
              erroneousTransfer.amount
            )} in credits intended for rental charges`
          )
        }
        console.log("\n")
      } catch (err) {
        console.log(err)
      }
    }
  }
}

const getPresentChargebeeCreditBalance = (
  creditsGroupedByChargebeeCustomerId,
  chargebeeCustomerId
) => {
  const creditLogs = creditsGroupedByChargebeeCustomerId[chargebeeCustomerId]
  return Math.round(
    creditLogs.reduce(
      (acc, curval) =>
        curval.type === "increment" ? acc + curval.amount : acc - curval.amount,
      0
    )
  )
}

const getErroneousAutomaticCreditsMoveInfo = (
  creditsGroupedByChargebeeCustomerId,
  chargebeeCustomerId
) => {
  const credits = creditsGroupedByChargebeeCustomerId[chargebeeCustomerId]
  const sortedCredits = orderBy(credits, ["created_at", "desc"])
  const automaticMoveLogIndex = sortedCredits.findIndex(a =>
    a.description.includes("Automatically move to internal system")
  )
  if (automaticMoveLogIndex > 0) {
    const logBeforeAutomaticMove = sortedCredits[automaticMoveLogIndex - 1]
    if (logBeforeAutomaticMove.description.includes("rental charges")) {
      return {
        amount: logBeforeAutomaticMove.amount,
      }
    }
  }

  return null
}

const getInvoicesWithCreditsAppliedTowardGrandfatheredPlan = (
  invoices,
  timeUtils
) => {
  const membershipRenewalInvoices = getMembershipRenewalCreditCreations(
    invoices,
    timeUtils
  )
  return membershipRenewalInvoices.filter(a => {
    const totalCreditsAppliedOnPlanCharge = getAmountIncorrectlyCreditedTowardGrandfatheredPlanCharge(
      a
    )
    return totalCreditsAppliedOnPlanCharge > 0
  })
}

const getAmountIncorrectlyCreditedTowardGrandfatheredPlanCharge = invoice => {
  const grandfatheredPlanCharge = invoice.line_items.find(a =>
    GRANDFATHERED_PLAN_IDS.includes(a.entity_id)
  )
  if (!grandfatheredPlanCharge) {
    return 0
  }
  const nonGrandfatheredPlanCharges = invoice.line_items.filter(
    a => a.id !== grandfatheredPlanCharge.id
  )
  const totalSpentOutsideOfPlanCharge = nonGrandfatheredPlanCharges.reduce(
    (acc, curval) => acc + curval.amount - curval.item_level_discount_amount,
    0
  )
  const totalPromotionalCreditsApplied =
    invoice.discounts?.find(a => a.entity_type === "promotional_credits")
      ?.amount || 0
  const totalCreditsAppliedOnPlanCharge = Math.max(
    totalPromotionalCreditsApplied - totalSpentOutsideOfPlanCharge,
    0
  )
  return totalCreditsAppliedOnPlanCharge
}

const formatPrice = cents => {
  const dollars = cents / 100
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  })
  return formatter.format(dollars)
}
run()

/*
FAILURE MODES AND CORRECTION STEPS

:: Customer switched to access-yearly and was incorrectly granted promotional credits
    -> Remove all undue credits from Chargebee without adding back to prisma
    -> If credits have been applied towards an invoice already, charge them for that invoice
*/

/*
// Add a more explicit failure mode for receiving promotional credits in response to access-monthly payment
// Add a failure mode for having been given ad hoc credits prior to the migration (0ct 1, 2021) and not being grandfathered
*/

/*
Case to look at https://seasons.chargebee.com/customers/61973235/details#promotional-credits

He seems to have gotten initial credits, but then none afterwards. He also had promotional credits apply towards membership charges.

*/
