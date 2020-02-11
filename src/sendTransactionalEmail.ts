import sgMail from "@sendgrid/mail"
import Handlebars from "handlebars"
import nodemailer from "nodemailer"
import fs from "fs"

const path = process.cwd()
const buffer = fs.readFileSync(path + "/" + "master-email.html")
const emailTemplate = buffer.toString()
const RenderedEmailTemplate = Handlebars.compile(emailTemplate)

const nodemailerTransport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "7b3330ee47f7b2",
    pass: "e81e7c28792bfa",
  },
})

export async function sendTransactionalEmail({
  to,
  data,
}: {
  to: string
  data: any
}) {
  const rendered = RenderedEmailTemplate(data)
  const msg = {
    from: { email: "membership@seasons.nyc", name: "Seasons NYC" },
    to,
    subject: data.email.subject,
    html: rendered,
  }
  if (process.env.NODE_ENV === "production") {
    sgMail.send(msg)
  } else {
    await nodemailerTransport.sendMail({
      from: "membership@seasons.nyc",
      ...msg,
    })
  }
}
