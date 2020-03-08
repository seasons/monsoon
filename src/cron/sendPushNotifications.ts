import { beamsClient } from "../resolvers/Mutation/auth"

export const sendPushNotifications = () => {
  beamsClient
    .publishToUsers(["kieran@seasons.nyc"], {
      apns: {
        aps: {
          alert: {
            title: "We've received your items!",
            subtitle: "You can reserve two more items",
          } as any,
          badge: 1,
        },
        data: {
          route: "Product",
          params: {
            id: "ck76fflg5x8490768fw9ihwad",
          },
        },
      } as any,
      fcm: {
        notification: {
          title: "We've received your items!",
          body: JSON.stringify({
            route: "Product",
            params: {
              id: "ck76fflg5x8490768fw9ihwad",
            },
          }),
        },
      },
    })
    .then(publishResponse => {
      console.log("Just published:", publishResponse.publishId)
    })
    .catch(error => {
      console.error("Error:", error)
    })
}

sendPushNotifications()
