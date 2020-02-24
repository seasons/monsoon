import request from "request"
import { getAuth0ManagementAPIToken } from "./getAuth0ManagementAPIToken"

export interface Auth0User {
  email: string
  family_name: string
  given_name: string
  user_id: string
}
export const getAuth0Users = async (): Promise<Auth0User[]> => {
  const token = await getAuth0ManagementAPIToken()
  return new Promise((resolve, reject) => {
    request(
      {
        method: "Get",
        url: `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        json: true,
      },
      (error, response, body) => {
        if (error) {
          return reject(error)
        }
        if (response.statusCode !== 200) {
          return reject(
            "Invalid status code <" +
              response.statusCode +
              ">" +
              "Response: " +
              JSON.stringify(response.body)
          )
        }
        return resolve(body)
      }
    )
  })
}
