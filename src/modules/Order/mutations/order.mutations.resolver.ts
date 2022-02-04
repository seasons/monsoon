import { Customer, User } from "@app/decorators"
import { Select } from "@app/decorators/select.decorator"
import { WinstonLogger } from "@app/lib/logger"
import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { ErrorService } from "@app/modules/Error/services/error.service"
import { BadRequestException, Logger } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"
import chargebee from "chargebee"
import { pick } from "lodash"

import { OrderService } from "../services/order.service"

@Resolver("Order")
export class OrderMutationsResolver {
  private readonly logger = (new Logger(
    `${OrderMutationsResolver.name}`
  ) as unknown) as WinstonLogger

  constructor(
    private readonly prisma: PrismaService,
    private readonly order: OrderService,
    private readonly segment: SegmentService,
    private readonly error: ErrorService
  ) {}

  @Mutation()
  async createDraftedOrder(
    @Args()
    {
      input: {
        orderType,
        productVariantID,
        productVariantIds,
        guest: { email, shippingAddress } = {
          email: null,
          shippingAddress: null,
        },
      },
    },
    @Customer() _customer,
    @User() _user,
    @Select() select
  ) {
    let user = _user
    let customer = _customer

    if (!!email) {
      if (!!user) {
        throw new Error("Do not pass guest input if user is logged in")
      }
      if (!shippingAddress) {
        throw new Error("Must pass shippingAddress if doing guest checkout")
      }
      if (orderType !== "Used") {
        throw new Error("Guest checkout only works for used orders")
      }

      const existingGuestCustomer = await this.prisma.client.customer.findFirst(
        {
          where: { user: { email } },
          select: { id: true, status: true, user: { select: { id: true } } },
        }
      )
      if (
        existingGuestCustomer?.id &&
        existingGuestCustomer?.status !== "Guest"
      ) {
        throw new Error(
          "Customer is not a guest but guest params have been passed"
        )
      }

      const shippingAddressPayload = {
        name: shippingAddress.name,
        city: shippingAddress.city,
        zipCode: shippingAddress.postalCode,
        state: shippingAddress.state,
        address1: shippingAddress.street1,
        address2: shippingAddress.street2 || "",
      }
      const userSelect = {
        id: true,
        customer: {
          select: {
            id: true,
          },
        },
      }
      if (!!existingGuestCustomer) {
        user = await this.prisma.client.user.update({
          where: { email },
          data: {
            customer: {
              update: {
                detail: {
                  update: {
                    shippingAddress: {
                      update: shippingAddressPayload,
                    },
                  },
                },
              },
            },
          },
          select: userSelect,
        })
        customer = user.customer
      } else {
        user = await this.prisma.client.user.create({
          data: {
            email,
            customer: {
              create: {
                status: "Guest",
                detail: {
                  create: {
                    shippingAddress: {
                      create: shippingAddressPayload,
                    },
                  },
                },
              },
            },
          },
          select: userSelect,
        })
        customer = user.customer
        await chargebee.customer
          .create({
            id: user.id,
            first_name: "",
            last_name: "",
            email,
          })
          .request()
      }
    }

    if (!user) {
      throw new Error("No user logged in and no guest user found or created")
    }

    try {
      let draftOrder
      if (orderType === "New") {
        draftOrder = await this.order.buyNewCreateDraftedOrder({
          productVariantID,
          customer,
          user,
          select,
        })
      } else {
        draftOrder = await this.order.buyUsedCreateDraftedOrder({
          productVariantIds:
            productVariantIds?.length > 0
              ? productVariantIds
              : [productVariantID],
          customer,
          select,
        })
      }

      return draftOrder
    } catch (e) {
      console.log(e)
      this.error.setExtraContext({ productVariantID, userEmail: user.email })
      this.error.captureError(e)
      throw e
    }
  }

  @Mutation()
  async submitOrder(
    @Args()
    {
      input: {
        orderID,
        guest: { paymentMethodID, email } = {
          paymentMethodID: null,
          email: null,
        },
      },
    },
    @Customer() _customer,
    @User() _user,
    @Select() select
  ) {
    let user = _user
    let customer = _customer

    if (!!email) {
      if (!!user) {
        throw new Error("Do not pass guest input if user is logged in")
      }
      if (!paymentMethodID) {
        throw new Error("Must pass paymentMethodID if doing guest checkout")
      }
      const existingGuestCustomer = await this.prisma.client.customer.findFirst(
        {
          where: { user: { email }, status: "Guest" },
          select: { id: true, user: { select: { id: true } } },
        }
      )
      if (!existingGuestCustomer) {
        throw new Error("Guest customer not found")
      }
      user = existingGuestCustomer.user
      customer = existingGuestCustomer
    }

    try {
      const order = await this.prisma.client.order.findUnique({
        where: { id: orderID },
      })
      let submittedOrder
      if (order.type === "New") {
        submittedOrder = await this.order.buyNewSubmitOrder({
          order,
          customer,
          user,
          select,
        })
      } else {
        submittedOrder = await this.order.buyUsedSubmitOrder({
          order,
          customer,
          select,
          paymentMethodID,
        })
      }

      this.segment.track(user.id, "Submitted Order", {
        orderID,
        ...pick(user, ["firstName", "lastName", "email"]),
      })

      return submittedOrder
    } catch (e) {
      console.log(e)
      this.logger.error(`Error while submitting order`, {
        customer,
        error: e,
        user,
        email: user.email,
      })
      throw new BadRequestException()
    }
  }

  @Mutation()
  updateOrderStatus(@Args() { orderID, status }, @Select() select) {
    return this.order.updateOrderStatus({ orderID, status, select })
  }
}
