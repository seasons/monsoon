import { Injectable } from "@nestjs/common"

export enum PushNotificationID {
  ResetBag,
  ReturnDue,
}

@Injectable()
export class PushNotificationsDataProvider {
  getPushNotifData(pushNotifID: PushNotificationID) {
    return this.wrapAPNsData(this.pushNotifDefinitions[pushNotifID])
  }

  private wrapAPNsData = a => ({ apns: { aps: { alert: a } } })

  private pushNotifDefinitions = {
    [PushNotificationID.ResetBag]: {
      title: "Your bag has been reset!",
      body:
        "Your bag has been reset. You are now free to place another reservation.",
    },
    [PushNotificationID.ReturnDue]: {
      title: "Your return is due soon",
      body:
        "Your return is due in 3 days. Please ensure to ship back your items.",
    },
  }
}
