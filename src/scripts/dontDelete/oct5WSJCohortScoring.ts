import "module-alias/register"

import { head } from "lodash"
import moment from "moment"
import { Client } from "pg"

import { PrismaService } from "../../prisma/prisma.service"

const csvwriter = require("csv-writer")

const formatDate = d => moment(d).format("dd, MMM Do, h:mm a")

// const config = {
//   database: "database-name",
//   host: "host-or-ip",
//   // this object will be passed to the TLSSocket constructor
//   ssl: {
//     rejectUnauthorized: false,
//     ca: fs.readFileSync("/path/to/server-certificates/root.crt").toString(),
//     key: fs.readFileSync("/path/to/client-key/postgresql.key").toString(),
//     cert: fs
//       .readFileSync("/path/to/client-certificates/postgresql.crt")
//       .toString(),
//   },
// }

const run = async () => {
  const ps = new PrismaService()
  const pg = new Client()

  /*    
    Get the all the users who've created an account since Oct 5

    For all:
        -> Has this person signed in on the app?
        -> How many frontend events do we have from them?
        -> How many items do they have in their bag?
        -> Which emails have they received? For each one, have they read it? Have they clicked on it?
        -> Which text messages have they received?
        -> Which push notifs have they received?
        -> What is their mixpanel history link?

    For those who are waitlisted
        -> who is eligible for admission?
        -> What was the plain text time of their waitlisting?
  */

  //@ts-ignore
  await pg.connect()
  try {
    const result = await pg.query(
      `SELECT * from monsoon$production."Customers" LIMIT 1`
    )
    const statusOrder = ["Authorized", "Waitlisted", "Created"]
    let wsjLeadCustomers = await ps.binding.query.customers(
      {
        where: {
          AND: [
            { user: { createdAt_gte: new Date(2020, 9, 5) } },
            { user: { email_not_contains: "seasons.nyc" } },
            { status_not: "Active" },
          ],
        },
      },
      `{
        status
        user {
          firstName 
          lastName 
          email
          createdAt
        }
      }`
    )
    wsjLeadCustomers.sort(
      (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    )

    const emailReceipts = await ps.binding.query.emailReceipts(
      {
        where: { user: { email_in: wsjLeadCustomers.map(a => a.user.email) } },
      },
      `{
        user {
          email
        }
        emailId
        createdAt
      }`
    )

    const records = wsjLeadCustomers.map(a => {
      const emailReceiptsForUser = emailReceipts.filter(
        b => b.user.email === a.user.email
      )

      const getAuthFields = receipts => {
        const youreInReceipt = head(
          emailReceiptsForUser.filter(c => c.emailId === "CompleteAccount")
        )
        if (!youreInReceipt) {
          return ""
        }
        const createdAtMoment = moment(youreInReceipt.createdAt)
        return {
          authorizedAt: formatDate(youreInReceipt.createdAt),
          authWindowClosesAt: formatDate(createdAtMoment.add(2, "days")),
        }
      }

      return {
        name: `${a.user.firstName} ${a.user.lastName}`,
        email: a.user.email,
        status: a.status,
        createdAt: formatDate(a.user.createdAt),
        ...getAuthFields(emailReceiptsForUser),
      }
    })

    const writer = csvwriter.createObjectCsvWriter({
      path: "oct5WSJLeadScoring.csv",
      header: [
        { id: "name", title: "Name" },
        { id: "email", title: "Email" },
        { id: "status", title: "Status" },
        { id: "createdAt", title: "Created At" },
        { id: "authorizedAt", title: "Authorized At" },
        { id: "authWindowClosesAt", title: "Auth Window Close Time" },
      ],
    })
    writer.writeRecords(records).then(() => console.log("...Done"))
  } catch (err) {
    console.log(err)
  } finally {
    await pg.end()
  }
}

run()
