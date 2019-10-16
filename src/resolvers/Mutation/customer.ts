import { Context } from "../../utils"
import { getCustomerFromContext } from "../../auth/utils"
import { UserInputError, ForbiddenError } from "apollo-server"

export const customer = {
  async addCustomerDetails(obj, { details }, ctx: Context, info) {
    // They also should not have included any "id" in the input
    if (details.id != null) {
      throw new UserInputError("payload should not include id")
    }
    console.log(ctx.req.header("Authorization"))
    // const fs = require("fs")

    //   console.log("The file was saved!")
    // })
    // console.log(ctx.request.get("headers"))
    // // Grab the customer off the context
    // let customer
    // try {
    //   customer = getCustomerFromContext(ctx)
    // } catch (err) {
    //   throw new Error(err)
    // }

    // // Add the details. If necessary, create the detals object afresh.
    // let updatedDetails
    // if (customer.detail == null) {
    //   try {
    //     updatedDetails = await ctx.prisma.createCustomerDetail(details)
    //   } catch (err) {
    //     throw new Error(err)
    //   }
    // } else {
    //   try {
    //     updatedDetails = await ctx.prisma.updateCustomerDetail({
    //       data: details,
    //       where: { id: customer.detail.id },
    //     })
    //   } catch (err) {
    //     throw new Error(err)
    //   }
    // }

    // Return the updated customer object

    return {
      customer: "hello",
    }
  },
}

// Test plan
// If they try a mutation with an id, they get an error -- CHECK
// If they use no token, they get a 401
// If they use a token for an admin, they get an error
// If they use a token for a partner, they get an error
// If they add details to a customer with no existing customerDetail record,
// a new record is created and linked to the customer
// If they add details to a customer with an existing customerDetail record,
// no new record is created, the existing customer details record is updated,
// and any details that were supplied on the call are over-written
// If they try the call with a jwt token, they get a 401

// type CustomerDetailCreateInput {
//     id: ID
//     phoneNumber: String
//     birthday: DateTime
//     height: Int
//     bodyType: String
//     averageTopSize: String
//     averagePantSize: String
//     preferredPronouns: String
//     profession: String
//     partyFrequency: String
//     travelFrequency: String
//     shoppingFrequency: String
//     averageSpend: String
//     customer: CustomerCreateOneWithoutDetailInput!
//     shippingAddress: LocationCreateOneInput
//     }

// type CustomerCreateOneWithoutDetailInput {
//     create: CustomerCreateWithoutDetailInput
//     connect: CustomerWhereUniqueInput
//     }

// type LocationCreateOneInput {
//     create: LocationCreateInput
//     connect: LocationWhereUniqueInput
//     }

// fai100, Password10!
// eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlJVRXpRVGcyUlVSQ01UWTRNMFJHTlRNelFqSkZNVVk0UVVZNFJEQTRNRFZFUkRoRVFqYzNSUSJ9.eyJpc3MiOiJodHRwczovL3NlYXNvbnMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVkYTY0NmU1YzJmNjkyMGMzNDEyNWNhMCIsImF1ZCI6Imh0dHBzOi8vbW9uc29vbi1zdGFnaW5nLmhlcm9rdWFwcC5jb20vIiwiaWF0IjoxNTcxMTc4MjEzLCJleHAiOjE1NzEyNjQ2MTMsImF6cCI6Im92V3pxbnQ4UXY1bFE0ZGh6cHhkRmIydTR6ak9nM0NtIiwiZ3R5IjoicGFzc3dvcmQifQ.rTbSwHeNlwXyY4PhqNpf7FnTfgAVeUX1HGQ7QqEiHk54V1vfagLekRAjWjtcrTGcFmqxTuV6rTx6QCoWlA9zP8NQYn6KHMsELYRa30pQF_nPUEcqeoM2HwtY8Od-DN_yujXMtSbZQXJjryerahLznbfYmvJTdYDOA6-VI0H2KG3HgZ0HcS32IOvJJ2HgDmkj6k1Ly1oMaQZU5fMnZH1FsiQAhBIpWaywiu-CIQJ4fJDhgyVAEn9aAsCHCAt6eWux9J9cfpO6iZ1J25ydxuO_DSmAr_g83973Ku3Ai7isb-e-rAP5RaoUR_Qy_KKptjo0ehfhmAcN_xZcHP_Mo9krWA
