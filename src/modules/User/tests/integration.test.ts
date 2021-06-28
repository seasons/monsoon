import request from "supertest"

import * as queryMap from "../../../tests/complete.queryMap.json"

const server = "http://localhost:4000/"
let token = "Bearer "

const variableMap = {
  LogIn: {
    email: "test_ci@seasons.nyc",
    password: "Seasons2020",
  },
  GetProductsByTag: {
    tag: "Collared",
    first: 10,
    skip: 0,
    orderBy: "id_DESC",
  },
}

describe("INTEGRATION TEST -- QUERIES", () => {
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

        done()
      })
  })
})
