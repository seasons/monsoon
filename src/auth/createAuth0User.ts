import request from "request"
import { PW_STRENGTH_RULES_URL } from "./utils"

export const createAuth0User = (
  email: string,
  password: string,
  details: {
    firstName: string
    lastName: string
  }
): Promise<string> => {
  const { firstName, lastName } = details
  return new Promise(function CreateUserAndReturnId(resolve, reject) {
    request(
      {
        method: "Post",
        url: `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
        headers: { "content-type": "application/json" },
        body: {
          given_name: firstName,
          family_name: lastName,
          email,
          password,
          client_id: `${process.env.AUTH0_CLIENTID}`,
          connection: `${process.env.AUTH0_DB_CONNECTION}`,
        },
        json: true,
      },
      function handleResponse(error, response, body) {
        // Handle a generic error
        if (error) {
          return reject(new Error(`Error creating Auth0 user: ${error}`))
        }
        // Give a precise error message if a user tried to sign up with an
        // email that's already in the db
        if (response.statusCode == 400 && body.code === "invalid_signup") {
          return reject(new Error("400 -- email already in db"))
        }
        // Give a precise error message if a user tried to sign up with
        // a insufficiently strong password
        if (
          response.statusCode == 400 &&
          body.name === "PasswordStrengthError"
        ) {
          return reject(
            new Error(
              `400 -- insufficiently strong password. see pw rules at ${PW_STRENGTH_RULES_URL}`
            )
          )
        }
        // If any other error occured, expose a generic error message
        if (response.statusCode != 200) {
          return reject(
            new Error(
              `Error creating new Auth0 user. Auth0 returned ` +
                `${response.statusCode} with body: ${JSON.stringify(body)}`
            )
          )
        }
        return resolve(body._id)
      }
    )
  })
}
