import "module-alias/register"

import sgMail from "@sendgrid/mail"

import { SegmentService } from "../../modules/Analytics/services/segment.service"

const run = async () => {
  const segment = new SegmentService()
  segment.track("cko4u0ze700ml0904w66rilsj", "Completed Transaction", {
    firstName: "Faiyam",
    lastName: "Rahman",
    email: "whatever@gmail.com",
    amount: 135.78,
    currency: "USD",
    total: 135.78,
  })
}

run()
