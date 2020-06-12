import { Injectable } from "@nestjs/common"

@Injectable()
export class FAQService {
  getSections() {
    return [
      {
        title: "Need to return your items?",
        subsections: [
          {
            title: "Ready to return your items?",
            text:
              "Pack up the pieces you want to return with the included hangers, attach the pre-paid shipping label and drop it off at your closest UPS or UPS pickup location.",
          },
          {
            title: "Did something not fit?",
            text:
              "We’re happy to help you find something that fits. Pack it up, send it back, and we’ll swap it out.",
          },
          {
            title: "Received the wrong item?",
            text:
              "Sorry about that! Pack it up, attach the pre-paid shipping label and send it back. We’ll get you the right one.",
          },
          {
            title: "Lost your return label?",
            text:
              "It happens. We understand. Contact us below and we’ll send you a new label.",
          },
        ],
      },
    ]
  }
}
