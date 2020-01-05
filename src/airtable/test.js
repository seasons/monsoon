var Airtable = require("airtable")
var base = new Airtable({ apiKey: "key5jLbpSewBdphPB" }).base(
  "app9otmmsjksEbOHZ"
)

console.log(
  base("BillingInfos").create({
    fields: {
      Brand: "yo",
      Name: "yo",
      LastDigits: "yo",
      "Expiration Month": "yo",
      "Expiration Year": "yo",
      "Street 1": "yo",
      "Street 2": "yo",
      City: "yo",
      State: "yo",
      Country: "yo",
      "Postal Code": "yo",
    },
  })
)
