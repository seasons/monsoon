export type SMSID =
  | "CompleteAccount"
  | "TwentyFourHourAuthorizationFollowup"
  | "Rewaitlisted"
  | "ResumeReminder"

export type SMSPayload = {
  body: string
  mediaUrls: string[]
}
