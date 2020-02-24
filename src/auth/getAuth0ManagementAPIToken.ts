import request from "request"

export const getAuth0ManagementAPIToken = async () => {
  return new Promise((resolve, reject) => {
    request(
      {
        method: "POST",
        url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        headers: { "content-type": "application/x-www-form-urlencoded" },
        form: {
          grant_type: "client_credentials",
          client_id: process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_ID,
          client_secret: process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_SECRET,
          audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        },
      },
      (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode !== 200) {
          return reject(response.body)
        }
        return resolve(JSON.parse(body).access_token)
      }
    )
  })
}
