import { graphqlTestCall } from "./utils/gqlTestClient"

describe("Me", () => {
  it("allows logged in user fetch their information", async () => {
    const response = await graphqlTestCall(
      `
        {
          me {
            user {
              id
              firstName
              lastName
              email
            }
          }
        }
      `
    )

    expect(response.data.me.user.id).toEqual("12345")
  })
})
