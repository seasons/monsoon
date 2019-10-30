import { base } from "./config"

export const createUser = (user, details) => {
  const { email, firstName, lastName } = user
  const { phoneNumber } = details

  const data = {
    Email: email,
    "First Name": firstName,
    "Last Name": lastName,
    "Phone Number": phoneNumber,
  }

  base("Users").create([
    {
      fields: data,
    },
  ])
}
