import { base } from "./config"

export const createUser = user => {
  const { email, firstName, lastName } = user

  const data = {
    Email: email,
    "First Name": firstName,
    "Last Name": lastName,
  }

  base("Users").create([
    {
      fields: data,
    },
  ])
}
