import { Injectable } from "@nestjs/common"

@Injectable()
export class FAQService {
  getSections(sectionType) {
    return [
      {
        title: "Frequently asked questions",
        subsections: [
          {
            title: "1. Lost your pre-paid return label?",
            text:
              "It should be behind the shipping label in the front bag pocket or inside the bag. Lost it? Contact us below and we’ll send you a new one.",
          },
          {
            title: "2. Stains, tears, or missing buttons?",
            text:
              "We cover any missing buttons, minor stains, and tears. If anything is beyond repair, we just charge a small fee to replace the item.",
          },
          {
            title: "3. Did something not fit?",
            text:
              "Pack it up and send it back! After we process your return, we’ll reset your bag and you can order something new. Don’t worry it won’t count towards your 30-day swap.",
          },
          {
            title: "4. Can I order something new before 30-days?",
            text:
              "Yes! You can buy a swap for $35 and exchange your items ahead of your 30-day window. Just pack up the items and send them back.",
          },
          {
            title: "5. Can I purchase items I want to keep?",
            text:
              "Select items are available for purchase and more get added over time. If you see something you like that doesn’t have a buy button, just send us a note. We may make an exception.",
          },
          {
            title: "6. How often do you add new items?",
            text:
              "We release new items every Friday and restock clean items on Mondays and Thursdays.",
          },
          {
            title: "7. How does shipping work?",
            text:
              "Free ground shipping and returns are included. Ground shipping averages 1-2 days in the NY metro area, 3-4 days for the Midwest + Southeast, and 5-7 days on the West Coast. For fasting shipping times out west, upgrade to 3-day UPS select before placing your reservation.",
          },
          {
            title: "8. Should I wash items myself?",
            text:
              "Please don’t wash items at home. In an effort to maximize the life of our clothing, we restore and professionally dry clean each piece.",
          },
          {
            title: "9. Lost your Seasons bag?",
            text:
              "No problem. We charge a small replacement fee of $15 for any lost re-usable garment bag. Just reach out and we’ll get you a new one.",
          },
        ],
      },
    ]
  }
}
