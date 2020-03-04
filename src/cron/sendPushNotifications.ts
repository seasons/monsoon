import { beamsClient } from "../resolvers/Mutation/auth"

export const sendPushNotifications = () => {
  beamsClient
    .publishToUsers(["luc@seasons.nyc"], {
      apns: {
        aps: {
          alert: {
            title: "We've received your items!",
            subtitle: "You can reserve two more items",
          } as any,
          badge: 1,
        },
        data: {
          route: "Bag",
          params: {
            id: 123,
          },
        },
      } as any,
      fcm: {
        notification: {
          title: "We've received your items!",
          body: JSON.stringify({
            route: "Bag",
            params: {
              id: 123,
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
