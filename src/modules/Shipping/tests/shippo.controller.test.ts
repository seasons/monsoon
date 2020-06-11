describe("Shippo Controller", () => {
  it("process events", () => {})
})

const TestData = {
  metadata: "Shippo test webhook",
  event: "track_updated",
  data: {
    test: true,
    transaction: null,
    tracking_history: [
      {
        location: {
          country: "US",
          zip: "94103",
          state: "CA",
          city: "San Francisco",
        },
        substatus: null,
        status_date: "2020-03-08T01:29:06.473Z",
        status_details:
          "The carrier has received the electronic shipment information.",
        status: "UNKNOWN",
        object_id: "7d7dc41675384da5b0b6d17545fb39d2",
        object_updated: null,
        object_created: "2020-03-12T09:49:06.473Z",
      },
      {
        location: {
          country: "US",
          zip: "94103",
          state: "CA",
          city: "San Francisco",
        },
        substatus: null,
        status_date: "2020-03-09T03:34:06.473Z",
        status_details: "Your shipment has departed from the origin.",
        status: "TRANSIT",
        object_id: "8bbc3b13964e4ac2b0a2e8b69297e98a",
        object_updated: null,
        object_created: "2020-03-12T09:49:06.473Z",
      },
      {
        location: {
          country: "US",
          zip: "37501",
          state: "TN",
          city: "Memphis",
        },
        substatus: null,
        status_date: "2020-03-10T05:39:06.473Z",
        status_details:
          "The Postal Service has identified a problem with the processing of this item and you should contact support to get further information.",
        status: "FAILURE",
        object_id: "334124a6c1fa4e70a94cd60e9b4e35d8",
        object_updated: null,
        object_created: "2020-03-12T09:49:06.473Z",
      },
      {
        location: {
          country: "US",
          zip: "60611",
          state: "IL",
          city: "Chicago",
        },
        substatus: null,
        status_date: "2020-03-11T07:44:06.473Z",
        status_details: "Your shipment has been delivered.",
        status: "DELIVERED",
        object_id: "a2b1d2301c294226ada274784a76cdb1",
        object_updated: null,
        object_created: "2020-03-12T09:49:06.473Z",
      },
    ],
    tracking_status: {
      location: {
        country: "US",
        zip: "60611",
        state: "IL",
        city: "Chicago",
      },
      substatus: null,
      status_date: "2020-03-11T07:44:06.471Z",
      status_details: "Your shipment has been delivered.",
      status: "DELIVERED",
      object_id: "2d3d646335e449a8b0308f798970d045",
      object_updated: null,
      object_created: "2020-03-12T09:49:06.471Z",
    },
    metadata: null,
    messages: [],
    carrier: null,
    tracking_number: "SHIPPO_DELIVERED",
    address_from: {
      country: "US",
      zip: "94103",
      state: "CA",
      city: "San Francisco",
    },
    address_to: {
      country: "US",
      zip: "60611",
      state: "IL",
      city: "Chicago",
    },
    eta: "2020-03-11T09:49:06.459Z",
    original_eta: "2020-03-10T09:49:06.459Z",
    servicelevel: {
      name: null,
      token: "shippo_priority",
    },
  },
  carrier: "shippo",
  test: true,
}
