import { Context } from "../utils"

export const MembershipInfo = (parent, args, ctx: Context, info) => {
  return {
    results: [
      {
        type: "essential", 
        __typename: "PlanInfo", 
        price: "155", 
        whatsIncluded: [
          "3 pieces every month", 
          "Keep for up to 30 days",
          "Free returns & dry cleaning",
          "Pause or cancel anytime"
        ]
      },
      {
        type: "allAccess", 
        __typename: "PlanInfo", 
        price: "195", 
        whatsIncluded: [
          "3 pieces at a time", 
          "Unlimited swaps",
          "Free returns & dry cleaning",
          "Pause or cancel anytime"
        ]
      }
    ]
  }
}
