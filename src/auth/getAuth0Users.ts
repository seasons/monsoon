import request from "request"

export interface Auth0User {
  email: string
  family_name: string
  given_name: string
  user_id: string
}
export const getAuth0Users = async (): Promise<Auth0User[]> =>
  new Promise((resolve, reject) => {
    request(
      {
        method: "Get",
        url: `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_TOKEN}`,
        },
        json: true,
      },
      (error, response, body) => {
        if (error) {
          return reject(error)
        }
        if (response.statusCode !== 200) {
          return reject("Invalid status code <" + response.statusCode + ">")
        }
        return resolve(body)
      }
    )
  })
