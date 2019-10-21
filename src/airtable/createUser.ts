import { base } from "./config"

export const createUser = (user, details) => {
  const { email, firstName, lastName } = user

  base("Users").create([
    {
      fields: {
        Email: email,
        "First Name": firstName,
        "Last Name": lastName,
      },
    },
  ])
}
