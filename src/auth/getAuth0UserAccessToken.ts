import request from "request"

export const getAuth0UserAccessToken = (
  email,
  password
): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> => {
  return new Promise(function RetrieveAccessToken(resolve, reject) {
    request(
      {
        method: "Post",
        url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        headers: { "content-type": "application/json" },
        body: {
          grant_type: "password",
          username: email,
          password,
          scope: "offline_access",
          audience: `${process.env.AUTH0_AUDIENCE}`,
          client_id: `${process.env.AUTH0_CLIENTID}`,
          client_secret: `${process.env.AUTH0_CLIENT_SECRET}`,
        },
        json: true,
      },
      function handleResponse(error, response, body) {
        if (error) {
          return reject(new Error(`Error retrieving access token: ${error}`))
        }
        if (response.statusCode != 200) {
          return reject(
            new Error(
              `Error retrieving access token from Auth0. Auth0 returned ` +
                `${response.statusCode} with body: ${JSON.stringify(body)}`
            )
          )
        }
        return resolve(body)
      }
    )
  })
}
