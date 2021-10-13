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
              "It should be attached behind the shipping label in the front bag pocket. Lost it? Contact us below and we’ll send you a new one.",
          },
          {
            title: "2. Damaged an item?",
            text:
              "We cover any missing buttons, minor stains, and tears. If anything is beyond repair, lost, or stolen we charge the following fees:\n· First Time: Fee equal to 50% of the retail value\n· Second Time: Fee equal to 75% of the retail value\n· Third Time: Fee equal to 100% of the retail value and membership is canceled.",
          },
          {
            title: "3. Did something not fit?",
            text:
              "Pack it up and send it back. After we process your return, we’ll reset your bag and you can order something new. Don’t worry, you won’t be charged for any size-related returns as long as you email us and let us know 24 hours after receiving your order.",
          },
          {
            title: "4. How many items can I have out?",
            text:
              "You can reserve up to 6 items out at a time. Have room in your bag? Take advantage of new releases and restocks by ordering anytime throughout the month.",
          },
          {
            title: "5. How does billing work?",
            text:
              "You’re only billed for what you use. At the end of your 30-day billing cycle, we’ll add up your rental and give you a clear, itemized invoice. Holding onto something for longer than 30-days? Don’t worry. We’ll pro-rate any extra time and add it to next month's invoice.",
          },
          {
            title: "6. What if I rent something for less than a month?",
            text:
              "There's a 40% minimum rental charge for all items. After the 12th day, you're billed by the day and it's added to your tab. Also, you're not charged for items in transit to you and back to us.",
          },
          {
            title: "7. Can I purchase items I want to keep?",
            text:
              "Select items are available for purchase and more get added over time. If you see something you like that doesn’t have a buy button, just send us a note. We may make an exception.",
          },
          {
            title: "8. How often do you add new items?",
            text:
              "We release new items every week and restock clean items on Tuesdays and Thursdays. See something you like that’s out of stock? Tap “Notify me” in the app to be the first to know when it’s available again.",
          },
          {
            title: "9. How does shipping work?",
            text:
              "Free ground shipping and returns are included in your monthly membership fee for your first order every month. Ground shipping averages 1-2 days in the NY metro area, 3-4 days for the Midwest + Southeast, and 5-7 days on the West Coast. For faster shipping times out west, upgrade to 3-day UPS select before placing your reservation.",
          },
          {
            title: "10. Should I wash items myself?",
            text:
              "Please don’t wash items at home. In an effort to maximize the life of our clothing, we restore and professionally dry clean each piece.",
          },
          {
            title: "11. Lost your Seasons bag or hangers?",
            text:
              "No problem. We charge a replacement fee of $15 for any lost re-usable garment bag and $5 for each hanger. Just email us and we’ll coordinate your return.",
          },
          {
            title: "12. Need to cancel your membership?",
            text:
              "Please contact us within 48 hours of signing up and we'll be happy to help you cancel. After this window, it's a 3-month commitment.",
          },
        ],
      },
    ]
  }
}
