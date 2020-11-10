import { Injectable } from "@nestjs/common"

@Injectable()
export class FAQService {
  getSections(sectionType) {
    if (!!sectionType && sectionType === "PaymentPlanPage") {
      return [
        {
          title: "Frequently asked questions",
          subsections: [
            {
              title: "How often do you add new items?",
              text:
                "We release new items every Friday and restock clean items on Mondays and Thursdays.",
            },
            {
              title: "What is a “Swap”?",
              text:
                "A swap is you sending back an item for another. Whenever we receive your return, we’ll reset your bag slots and you can place a new order!",
            },
            {
              title: "How does shipping work?",
              text:
                "Free ground shipping and returns are included in both plans. Ground shipping averages 1-2 days in the NY metro area, 3-4 days for the Midwest + Southeast, and 5-7 days on the West coast. For faster shipping times out west, upgrade to 3-day UPS select.",
            },
            {
              title: "What if something doesn’t fit?",
              text:
                "Pack it up and send it back! We’ll make sure you get the right size or another item that fits. On an Essential plan? Any exchanges regarding size do not count towards your monthly swap.",
            },
            {
              title: "Which cities are you in?",
              text:
                "If you've been authorized to finish choosing your plan, we service your area!",
            },
          ],
        },
      ]
    } else {
      return [
        {
          title: "Frequently asked questions",
          subsections: [
            {
              title: "How often do you add new items?",
              text:
                "We release new items every Friday and restock clean items on Mondays and Thursdays.",
            },
            {
              title: "What is a “Swap”?",
              text:
                "A swap is you sending back an item for another. Whenever we receive your return, we’ll reset your bag slots and you can place a new order!",
            },
            {
              title: "How does shipping work?",
              text:
                "Free ground shipping and returns are included in both plans. Ground shipping averages 1-2 days in the NY metro area, 3-4 days for the Midwest + Southeast, and 5-7 days on the West coast. For faster shipping times out west, upgrade to 3-day UPS select.",
            },
            {
              title: "What if something doesn’t fit?",
              text:
                "Pack it up and send it back! We’ll make sure you get the right size or another item that fits. On an Essential plan? Any exchanges regarding size do not count towards your monthly swap.",
            },
            {
              title: "Ready to return your items?",
              text:
                "Pack up the pieces you want to return with the included hangers, attach the pre-paid shipping label and drop it off at your closest UPS or UPS pickup location.",
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
}
