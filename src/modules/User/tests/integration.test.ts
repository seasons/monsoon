import request from "supertest"

import * as queryMap from "../../../tests/complete.queryMap.json"

const server = "http://localhost:4000/"
let token = "Bearer "

// NOTE - not in queryMap but required for reservation flow
const addToBagMutation = `mutation addToBag($item: ID!) {\n  addToBag(item: $item) {\n    id\n    productVariant {\n      id\n      reservable\n      reserved\n      nonReservable\n    }\n    status\n  }\n}\n`

// Query variables mapped to queryMap keys
const variableMap = {
  LogIn: {
    email: "test_ci_6@seasons.nyc",
    password: "Seasons2020",
  },
  GetProductsByTag: {
    tag: "Collared",
    first: 10,
    skip: 0,
    orderBy: "id_DESC",
  },
  ReserveItems: {
    items: [],
  },
  GetCustomerReservationItems: {
    reservationID: "",
  },
  ReturnItems: {
    items: [],
  },
  GetBrands: {
    orderBy: "id_DESC",
  },
  PauseSubscription: {
    subscriptionID: "",
    pauseType: "WithoutItems",
  },
  ResumeSubscription: {
    subscriptionID: "",
  },
  updateShippingAddress: {
    name: "Bobby Tables",
    city: "Brooklyn",
    zipCode: "11249",
    state: "NY",
    address1: "185 Metropolitan Avenue",
    address2: "Apt 2R",
  },
}

describe("INTEGRATION TEST", () => {
  it("LogIn", done => {
    request(server)
      .post("/graphql")
      .send({
        operationName: "LogIn",
        query: queryMap.LogIn,
        variables: variableMap.LogIn,
      })
      .set("Accept", "/")
      .set("application", "spring")
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body).toBeInstanceOf(Object)
        expect(res.body.data).toBeInstanceOf(Object)
        expect(res.body.data.login).toBeInstanceOf(Object)
        expect(res.body.data.login.customer).toBeInstanceOf(Object)
        expect(res.body.data.login.user).toBeInstanceOf(Object)
        expect(res.body.data.login.token.length).toBeGreaterThan(100)

        token += res.body.data.login.token

        done()
      })
  })

  it("GetCustomer", done => {
    request(server)
      .post("/graphql")
      .send({
        operationName: "GetCustomer",
        query: queryMap.GetCustomer,
      })
      .set("Accept", "/")
      .set("application", "spring")
      .set("authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body).toBeInstanceOf(Object)
        expect(res.body.data).toBeInstanceOf(Object)
        expect(res.body.data.me).toBeInstanceOf(Object)

        done()
      })
  })

  it("GetUserPreferences", done => {
    request(server)
      .post("/graphql")
      .send({
        operationName: "GetUserPreferences",
        query: queryMap.GetUserPreferences,
      })
      .set("Accept", "/")
      .set("application", "spring")
      .set("authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body).toBeInstanceOf(Object)
        expect(res.body.data).toBeInstanceOf(Object)
        expect(res.body.data.me).toBeInstanceOf(Object)
        expect(res.body.data.me.customer).toBeInstanceOf(Object)
        expect(res.body.data.me.customer.user).toBeInstanceOf(Object)
        expect(res.body.data.me.customer.detail).toBeInstanceOf(Object)
        expect(res.body.data.me.customer.detail.shippingAddress).toBeInstanceOf(
          Object
        )

        done()
      })
  })

  it("GetMembershipInfo", done => {
    request(server)
      .post("/graphql")
      .send({
        operationName: "GetMembershipInfo",
        query: queryMap.GetMembershipInfo,
      })
      .set("Accept", "/")
      .set("application", "spring")
      .set("authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body).toBeInstanceOf(Object)
        expect(res.body.data).toBeInstanceOf(Object)
        expect(res.body.data.me).toBeInstanceOf(Object)
        expect(res.body.data.me.customer).toBeInstanceOf(Object)
        expect(res.body.data.me.customer.invoices).toBeInstanceOf(Object)
        expect(res.body.data.me.customer.membership).toBeInstanceOf(Object)
        expect(res.body.data.me.customer.membership.plan).toBeInstanceOf(Object)

        variableMap.PauseSubscription.subscriptionID =
          res.body.data.me.customer.membership.subscriptionId
        variableMap.ResumeSubscription.subscriptionID =
          res.body.data.me.customer.membership.subscriptionId

        done()
      })
  })

  it("GetUser", done => {
    request(server)
      .post("/graphql")
      .send({
        operationName: "GetUser",
        query: queryMap.GetUser,
      })
      .set("Accept", "/")
      .set("application", "spring")
      .set("authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body).toBeInstanceOf(Object)
        expect(res.body.data).toBeInstanceOf(Object)
        expect(res.body.data.me).toBeInstanceOf(Object)
        expect(res.body.data.me.customer).toBeInstanceOf(Object)
        expect(res.body.data.me.customer.user).toBeInstanceOf(Object)
        expect(res.body.data.me.customer.admissions).toBeInstanceOf(Object)
        expect(res.body.data.me.customer.membership).toBeInstanceOf(Object)
        expect(res.body.data.me.customer.detail).toBeInstanceOf(Object)
        expect(res.body.data.me.customer.detail.shippingAddress).toBeInstanceOf(
          Object
        )

        done()
      })
  })

  it("BeamsData", done => {
    request(server)
      .post("/graphql")
      .send({
        operationName: "BeamsData",
        query: queryMap.BeamsData,
      })
      .set("Accept", "/")
      .set("application", "spring")
      .set("authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body).toBeInstanceOf(Object)
        expect(res.body.data).toBeInstanceOf(Object)
        expect(res.body.data.me).toBeInstanceOf(Object)
        expect(res.body.data.me.user).toBeInstanceOf(Object)

        done()
      })
  })

  it("GetProductsByTag", done => {
    request(server)
      .post("/graphql")
      .send({
        operationName: "GetProductsByTag",
        query: queryMap.GetProductsByTag,
        variables: variableMap.GetProductsByTag,
      })
      .set("Accept", "/")
      .set("application", "spring")
      .set("authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body).toBeInstanceOf(Object)
        expect(res.body.data).toBeInstanceOf(Object)
        expect(res.body.data.products.length).toBe(10)

        const products = res.body.data.products
        const itemsToReserve = []

        for (const p of products) {
          if (itemsToReserve.length === 2) break

          const variants = p.variants

          for (const v of variants) {
            if (itemsToReserve.length === 2) break

            if (v.reservable > 0) {
              itemsToReserve.push(v.id)
            }
          }
        }

        variableMap.ReserveItems.items = itemsToReserve

        done()
      })
  })

  it("GetBrands", done => {
    request(server)
      .post("/graphql")
      .send({
        operationName: "GetBrands",
        query: queryMap.GetBrands,
        variables: variableMap.GetBrands,
      })
      .set("Accept", "/")
      .set("application", "spring")
      .set("authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body).toBeInstanceOf(Object)
        expect(res.body.data).toBeInstanceOf(Object)
        expect(res.body.data.brands).toBeInstanceOf(Array)

        done()
      })
  })

  describe("Reservation flow", () => {
    it("Add first item to bag", done => {
      request(server)
        .post("/graphql")
        .send({
          operationName: "addToBag",
          query: addToBagMutation,
          variables: { item: variableMap.ReserveItems.items[0] },
        })
        .set("Accept", "/")
        .set("application", "spring")
        .set("authorization", token)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)

          expect(res.body).toBeInstanceOf(Object)
          expect(res.body.data).toBeInstanceOf(Object)
          expect(res.body.data.addToBag).toBeInstanceOf(Object)
          expect(res.body.data.addToBag.productVariant.id).toBe(
            variableMap.ReserveItems.items[0]
          )
          expect(res.body.data.addToBag.status).toBe("Added")

          done()
        })
    })

    it("Add second item to bag", done => {
      request(server)
        .post("/graphql")
        .send({
          operationName: "addToBag",
          query: addToBagMutation,
          variables: { item: variableMap.ReserveItems.items[1] },
        })
        .set("Accept", "/")
        .set("application", "spring")
        .set("authorization", token)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)

          expect(res.body).toBeInstanceOf(Object)
          expect(res.body.data).toBeInstanceOf(Object)
          expect(res.body.data.addToBag).toBeInstanceOf(Object)
          expect(res.body.data.addToBag.productVariant.id).toBe(
            variableMap.ReserveItems.items[1]
          )
          expect(res.body.data.addToBag.status).toBe("Added")

          done()
        })
    })

    it("ReserveItems", done => {
      request(server)
        .post("/graphql")
        .send({
          operationName: "ReserveItems",
          query: queryMap.ReserveItems,
          variables: variableMap.ReserveItems,
        })
        .set("Accept", "/")
        .set("application", "spring")
        .set("authorization", token)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)

          expect(res.body).toBeInstanceOf(Object)
          expect(res.body.data).toBeInstanceOf(Object)
          expect(res.body.data.reserveItems).toBeInstanceOf(Object)
          expect(res.body.data.reserveItems.id.length).toBeGreaterThan(10)

          variableMap.GetCustomerReservationItems.reservationID =
            res.body.data.reserveItems.id

          done()
        })
    }, 10000)

    it("GetCustomerReservationItems", done => {
      request(server)
        .post("/graphql")
        .send({
          operationName: "GetCustomerReservationItems",
          query: queryMap.GetCustomerReservationItems,
          variables: variableMap.GetCustomerReservationItems,
        })
        .set("Accept", "/")
        .set("application", "spring")
        .set("authorization", token)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)

          expect(res.body).toBeInstanceOf(Object)
          expect(res.body.data).toBeInstanceOf(Object)
          expect(res.body.data.me).toBeInstanceOf(Object)

          done()
        })
    })

    it("ActiveReservation", done => {
      request(server)
        .post("/graphql")
        .send({
          operationName: "ActiveReservation",
          query: queryMap.ActiveReservation,
        })
        .set("Accept", "/")
        .set("application", "spring")
        .set("authorization", token)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)

          expect(res.body).toBeInstanceOf(Object)
          expect(res.body.data).toBeInstanceOf(Object)
          expect(res.body.data.me).toBeInstanceOf(Object)
          expect(res.body.data.me.activeReservation).toBeInstanceOf(Object)
          expect(res.body.data.me.activeReservation.products).toBeInstanceOf(
            Array
          )

          const products = res.body.data.me.activeReservation.products

          expect(products.length).toBe(2)
          expect(products[0].productVariant).toBeInstanceOf(Object)
          expect(products[0].productVariant.id).toBe(
            variableMap.ReserveItems.items[0]
          )
          expect(products[1].productVariant).toBeInstanceOf(Object)
          expect(products[1].productVariant.id).toBe(
            variableMap.ReserveItems.items[1]
          )

          variableMap.ReturnItems.items.push(products[0].id)
          variableMap.ReturnItems.items.push(products[1].id)

          done()
        })
    }, 10000)

    it("ReturnItems", done => {
      request(server)
        .post("/graphql")
        .send({
          operationName: "ReturnItems",
          query: queryMap.ReturnItems,
          variables: variableMap.ReturnItems,
        })
        .set("Accept", "/")
        .set("application", "spring")
        .set("authorization", token)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)

          expect(res.body).toBeInstanceOf(Object)
          expect(res.body.data).toBeInstanceOf(Object)
          expect(res.body.data.returnItems).toBeInstanceOf(Object)
          expect(res.body.data.returnItems.id.length).toBeGreaterThan(10)

          done()
        })
    })

    it("ReturnedItems", done => {
      request(server)
        .post("/graphql")
        .send({
          operationName: "ReturnedItems",
          query: queryMap.ReturnedItems,
        })
        .set("Accept", "/")
        .set("application", "spring")
        .set("authorization", token)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)

          expect(res.body).toBeInstanceOf(Object)
          expect(res.body.data).toBeInstanceOf(Object)
          expect(res.body.data.me).toBeInstanceOf(Object)
          expect(res.body.data.me.activeReservation).toBeInstanceOf(Object)
          expect(res.body.data.me.activeReservation.id).toBe(
            variableMap.GetCustomerReservationItems.reservationID
          )

          done()
        })
    })
  })

  it("PauseSubscription", done => {
    request(server)
      .post("/graphql")
      .send({
        operationName: "PauseSubscription",
        query: queryMap.PauseSubscription,
        variables: variableMap.PauseSubscription,
      })
      .set("Accept", "/")
      .set("application", "spring")
      .set("authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body).toBeInstanceOf(Object)
        expect(res.body.data).toBeInstanceOf(Object)
        expect(res.body.data.pauseSubscription).toBeTruthy()

        done()
      })
  })

  it("ResumeSubscription", done => {
    request(server)
      .post("/graphql")
      .send({
        operationName: "ResumeSubscription",
        query: queryMap.ResumeSubscription,
        variables: variableMap.ResumeSubscription,
      })
      .set("Accept", "/")
      .set("application", "spring")
      .set("authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body).toBeInstanceOf(Object)
        expect(res.body.data).toBeInstanceOf(Object)
        expect(res.body.data.resumeSubscription).toBeTruthy()

        done()
      })
  })

  it("updateShippingAddress", done => {
    request(server)
      .post("/graphql")
      .send({
        operationName: "updateShippingAddress",
        query: queryMap.updateShippingAddress,
        variables: variableMap.updateShippingAddress,
      })
      .set("Accept", "/")
      .set("application", "spring")
      .set("authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body).toBeInstanceOf(Object)
        expect(res.body.data).toBeInstanceOf(Object)
        expect(res.body.data.addCustomerDetails).toBeInstanceOf(Object)
        expect(res.body.data.addCustomerDetails.id.length).toBeGreaterThan(10)

        done()
      })
  })

  it("New Shipping address is saved", done => {
    request(server)
      .post("/graphql")
      .send({
        operationName: "GetCustomer",
        query: queryMap.GetCustomer,
      })
      .set("Accept", "/")
      .set("application", "spring")
      .set("authorization", token)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body).toBeInstanceOf(Object)
        expect(res.body.data).toBeInstanceOf(Object)
        expect(res.body.data.me).toBeInstanceOf(Object)
        expect(res.body.data.me.customer).toBeInstanceOf(Object)
        expect(res.body.data.me.customer.detail).toBeInstanceOf(Object)
        expect(res.body.data.me.customer.detail.shippingAddress).toBeInstanceOf(
          Object
        )

        const address = res.body.data.me.customer.detail.shippingAddress
        const expected = variableMap.updateShippingAddress

        expect(address.address1).toBe(expected.address1)
        expect(address.address2).toBe(expected.address2)
        expect(address.city).toBe(expected.city)
        expect(address.state).toBe(expected.state)
        expect(address.zipCode).toBe(expected.zipCode)

        done()
      })
  })
})
