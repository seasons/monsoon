import { Context } from "../../utils"
import { getCustomerFromContext } from "../../auth/utils"
import { UserInputError, ForbiddenError } from "apollo-server"

export const customer = {
  /*
    Test Cases for addCustomerDetails resolver:
    IF user submits an 'id' field in the resolver inputs, they get an error. 

    IF there is no value for the Authorization header, THEN they get a 401. 

    IF they use a token for an admin, THEN they get a 401

    IF they use a token for a partner, THEN they get a 401

    IF they add details to a customer with no existing customerDetail record, 
    THEN a new record is created 
    AND the customer record's "detail" field has the id of the newly created customerDetail record

    IF they add details to a customer with an existing details object
    THEN the existing record is updated, with any fields that were previously
    written to overwritten if the payload includes values for them. 
    */
  async addCustomerDetails(obj, { details }, ctx: Context, info) {
    // They also should not have included any "id" in the input
    if (details.id != null) {
      throw new UserInputError("payload should not include id")
    }

    // Grab the customer off the context
    let customer
    try {
      customer = await getCustomerFromContext(ctx)
    } catch (err) {
      throw new Error(err)
    }

    // Add the details. If necessary, create the details object afresh.
    let updatedDetails
    let currentCustomerDetail = await ctx.prisma
      .customer({ id: customer.id })
      .detail()
    if (currentCustomerDetail == null) {
      try {
        await ctx.prisma.updateCustomer({
          data: { detail: { create: details } },
          where: { id: customer.id },
        })
        updatedDetails = await ctx.prisma.customer({ id: customer.id }).detail()
      } catch (err) {
        throw new Error(err)
      }
    } else {
      try {
        updatedDetails = await ctx.prisma.updateCustomerDetail({
          data: details,
          where: { id: currentCustomerDetail.id },
        })
      } catch (err) {
        throw new Error(err)
      }
    }

    // Return the updated customer object
    return { ...customer, detail: updatedDetails }
  },
}
