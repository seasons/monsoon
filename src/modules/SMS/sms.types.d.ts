export type SMSID =
  | "CompleteAccount"
  | "TwentyFourHourAuthorizationFollowup"
  | "Rewaitlisted"

export type SMSPayload = {
  body: string
  mediaUrls: string[]
}
