export const reservationMock = jest.fn(() => {
  id: "123"
})

export const userMock = {
  id: "12345",
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@gmail.com",
  role: "Customer",
  sub: "auth0|5da61ffdeef18b0c5f5c2c6f",
}

export const detailsMock = {
  birthday: "1990-10-10",
  height: 69,
  weight: "120-130 lbs",
  bodyType: "Athletic",
  averageTopSize: "M",
  averageWaistSize: "29",
  averagePantLength: "30",
  preferredPronouns: "he/him",
  profession: "Consulting",
  phoneOS: "iOS",
  partyFrequency: "1 - 2 times a week",
  shoppingFrequency: "3 - 4 times a month",
  averageSpend: "$150 - $300 a month",
  style: "Hypebeast",
  shippingAddress: {
    create: {
      slug: "John-Doe-1577629988054",
      name: "John Doe",
      description: "Customer Shipping Address",
      address1: "10 Clinton Ave",
      address2: "Apt 10",
      city: "New York",
      state: "New York",
      zipCode: "10001",
      locationType: "Customer",
      user: { connect: { email: "johndoe+10@gmail.com" } },
    },
  },
}

export const customerMock = {
  reservations: [
    {
      id: "ck34nk1am0wr20795t0fs286d",
    },
    {
      id: "ck4ebem8o2su40761ihnv4p3f",
    },
    {
      id: "ck51inuvjdj0k0786s8m5yxrc",
    },
    {
      id: "ck52ou4k4amf00715muzvwzml",
    },
    {
      id: "ck52ranp0bnkv0715c2k5gi90",
    },
    {
      id: "ck5czhpxhelz40703bpyjsm6f",
    },
  ],
  id: "ck2ge3c2c06cf07577w6h298c",
  status: "Active",
  billingInfo: {
    id: "ck352wqls1rpc0795yq7dcj1f",
  },
  detail: detailsMock,
  user: {
    id: "ck2ge3byx06c70757us4chh91",
  },
  plan: "AllAccess",
}
