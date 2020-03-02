import { graphqlTestCall } from '../../../tests/utils/gqlTestClient';

describe('MeResolver', () => {
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

      expect(response.data.me.user.id).toEqual("ck2ge3byx06c70757us4chh91")
    })
  })
});
