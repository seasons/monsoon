export type SMSID =
  | "CompleteAccount"
  | "TwentyFourHourLeftAuthorizationFollowup"
  | "SeventyTwoHoursLeftAuthorizationFollowup"
  | "Rewaitlisted"
  | "ResumeReminder"

export type SMSPayload = {
  body: string
  mediaUrls: string[]
}
