import { graphqlTestCall } from "./utils/gqlTestClient"
import { detailsMock } from "./mocks"

describe("Customer", () => {
  describe("Add Customer Detail", () => {
    it("works as intended", async () => {
      const response = await graphqlTestCall(
        `
          mutation submitUserDetails($details: CustomerDetailCreateInput!) {
            addCustomerDetails(details: $details) {
              detail {
                birthday
                height
                bodyType
              }
            }
          }
        `,
        {
          details: detailsMock,
          status: "Waitlisted",
          event: "CompletedWaitlistForm",
        }
      )

      expect(response.data.addCustomerDetails.detail).toMatchObject({
        birthday: "1990-10-10",
        bodyType: "Athletic",
        height: 69,
      })
    })
  })
})
