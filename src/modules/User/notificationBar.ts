import { DateTime } from "luxon"

export const NOTIFICATION_BAR_DATA = {
  UpcomingMaintenance: {
    web: {
      title: "Planned maintenance",
      detail: `Seasons will be undergoing maintenance on ${DateTime.fromISO(
        process.env.MAINTENANCE_DATE
      ).toFormat(
        "LLLL d 'at' ha"
      )} for one hour. In this window, you may notice a period of downtime.`,
    },
    mobile: {
      title: "Planned maintenance",
      detail: `Seasons will be undergoing maintenance on ${DateTime.fromISO(
        process.env.MAINTENANCE_DATE
      ).toFormat(
        "LLLL d 'at' ha"
      )} for one hour. In this window, you may notice a period of downtime.`,
    },
    paletteID: "BlackAlert",
  },
  CurrentMaintenance: {
    web: {
      title: "Planned maintenance",
      detail:
        "Seasons is undergoing maintenance. You may notice a period of downtime for approximately one hour.",
    },
    mobile: {
      title: "Planned maintenance",
      detail:
        "Seasons is undergoing maintenance. You may notice a period of downtime for approximately one hour.",
    },
    underlinedCTAText: "",
    paletteID: "RedAlert",
  },
  PastDueInvoice: {
    web: {
      title: "You have a past due invoice",
      detail:
        "Update your billing info in order to avoid having your membership cancelled",
      route: { drawerView: "editPaymentMethod" },
    },
    mobile: {
      title: "You have a past due invoice",
      detail:
        "Update your billing info in order to avoid having your membership cancelled",
      route: { route: "AccountStack", screen: "EditCreditCard" },
    },
    underlinedCTAText: "",
    icon: "Chevron",
    paletteID: "RedAlert",
  },
  TestDismissable: {
    web: {
      title: "This is a test dismissable notif for local/staging",
      detail:
        "Click the notif to dismiss it. Check your env vars to turn this off",
      route: { dismissable: true },
    },
    mobile: {
      title: "This is a test dismissable notif for local/staging",
      detail:
        "Click the notif to dismiss it. Check your env vars to turn this off",
      route: { dismissable: true },
    },
    underlinedCTAText: "",
    icon: "CloseX",
    paletteID: "RedAlert",
  },
  AuthorizedReminder: {
    web: {
      title:
        "You're in! Sign up and finish choosing your plan to place your first reservation:",
      detail: "",
      route: { url: "/signup" },
    },
    mobile: {
      title: "You're in!",
      detail: "Sign up and finish choosing your plan",
      route: {
        route: "Modal",
        screen: "CreateAccountModal",
        params: {
          initialState: "ChoosePlan",
          initialUserState: "Admitted",
        },
      },
    },
    underlinedCTAText: "Secure your spot",
    icon: "Chevron",
    paletteID: "BlackAlert",
  },
}
