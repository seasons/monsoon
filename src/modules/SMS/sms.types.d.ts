export type SMSID =
  | "CompleteAccount"
  | "TwentyFourHourLeftAuthorizationFollowup"
  | "Rewaitlisted"

export type SMSPayload = {
  body: string
  mediaUrls: string[]
}
