export type SMSID =
  | "CompleteAccount"
  | "TwentyFourHourLeftAuthorizationFollowup"
  | "Rewaitlisted"
  | "ResumeReminder"

export type SMSPayload = {
  body: string
  mediaUrls: string[]
}
