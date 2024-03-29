import { cloneDeep, update } from "lodash"

const DeliveredEvent = {
  test: false,
  data: {
    messages: [],
    carrier: "ups",
    trackingNumber: "1Z73662R9092663604",
    addressFrom: { city: "Ny", state: "NY", zip: "10030", country: "US" },
    addressTo: { city: "Kearny", state: "NJ", zip: "07032", country: "US" },
    eta: "2020-06-30T04:00:00Z",
    originalEta: "2020-06-30T04:00:00Z",
    servicelevel: { token: "ups_ground", name: "Ground" },
    metadata: null,
    trackingStatus: {
      objectCreated: "2020-06-30T15:59:37.956Z",
      objectUpdated: "2020-06-30T15:59:37.956Z",
      objectId: "63f5d631de3a439aba156acbba670433",
      status: "DELIVERED",
      statusDetails: "Delivered",
      statusDate: "2020-06-30T15:01:13Z",
      substatus: {
        code: "delivered",
        text: "Package has been delivered.",
        actionRequired: false,
      },
      location: { city: "Kearny", state: "NJ", zip: "07032", country: "US" },
    },
    trackingHistory: [
      {
        objectCreated: "2020-06-23T19:44:42.045Z",
        objectUpdated: "2020-06-29T13:58:24.176Z",
        objectId: "62bc6071440b4b9f8111c2f7b1a6b697",
        status: "TRANSIT",
        statusDetails: "Drop-Off",
        statusDate: "2020-06-29T13:01:00Z",
        substatus: {
          code: "pickup_available",
          text: "Package is available for pickup at carrier location.",
          actionRequired: true,
        },
        location: { city: "New York", state: "NY", zip: "", country: "US" },
      },
      {
        objectCreated: "2020-06-30T10:48:03.050Z",
        objectUpdated: "2020-06-30T10:48:03.050Z",
        objectId: "69fd1842418c4605ab1a6733f7839b6d",
        status: "TRANSIT",
        statusDetails: "Origin Scan",
        statusDate: "2020-06-30T06:04:34Z",
        substatus: {
          code: "package_accepted",
          text:
            "Package has been accepted into the carrier network for delivery.",
          actionRequired: false,
        },
        location: {
          city: "Monroe Township",
          state: "NJ",
          zip: "",
          country: "US",
        },
      },
      {
        objectCreated: "2020-06-30T10:48:03.050Z",
        objectUpdated: "2020-06-30T10:48:03.050Z",
        objectId: "d29b9468a8624e71afa218f34da53013",
        status: "TRANSIT",
        statusDetails: "Departed from Facility",
        statusDate: "2020-06-30T08:00:00Z",
        substatus: {
          code: "package_departed",
          text:
            "Package has departed from an intermediate location in the carrier network.",
          actionRequired: false,
        },
        location: {
          city: "Monroe Township",
          state: "NJ",
          zip: "",
          country: "US",
        },
      },
      {
        objectCreated: "2020-06-30T10:48:03.050Z",
        objectUpdated: "2020-06-30T10:48:03.050Z",
        objectId: "56d715024d044ee7b2cd5a0bdcf19c25",
        status: "TRANSIT",
        statusDetails: "Arrived at Facility",
        statusDate: "2020-06-30T09:01:00Z",
        substatus: {
          code: "package_arrived",
          text:
            "Package has arrived at an intermediate location in the carrier network.",
          actionRequired: false,
        },
        location: { city: "Secaucus", state: "NJ", zip: "", country: "US" },
      },
      {
        objectCreated: "2020-06-30T10:48:03.050Z",
        objectUpdated: "2020-06-30T10:48:03.050Z",
        objectId: "68f102ee493c4376a1a1d9e9dece8e05",
        status: "TRANSIT",
        statusDetails: "Destination Scan",
        statusDate: "2020-06-30T09:54:45Z",
        substatus: {
          code: "delivery_scheduled",
          text: "Package is scheduled for delivery.",
          actionRequired: false,
        },
        location: { city: "Secaucus", state: "NJ", zip: "", country: "US" },
      },
      {
        objectCreated: "2020-06-30T10:48:03.050Z",
        objectUpdated: "2020-06-30T10:48:03.050Z",
        objectId: "0d9dbf7ecada4ea0a520ec13734814a2",
        status: "TRANSIT",
        statusDetails: "Loaded on Delivery Vehicle",
        statusDate: "2020-06-30T10:42:50Z",
        substatus: {
          code: "out_for_delivery",
          text: "Package is out for delivery.",
          actionRequired: false,
        },
        location: { city: "Secaucus", state: "NJ", zip: "", country: "US" },
      },
      {
        objectCreated: "2020-06-30T15:59:37.956Z",
        objectUpdated: "2020-06-30T15:59:37.956Z",
        objectId: "59941722d8e24ae99e720b9b8e045241",
        status: "TRANSIT",
        statusDetails: "Out For Delivery Today",
        statusDate: "2020-06-30T12:55:14Z",
        substatus: {
          code: "out_for_delivery",
          text: "Package is out for delivery.",
          actionRequired: false,
        },
        location: { city: "Secaucus", state: "NJ", zip: "", country: "US" },
      },
      {
        objectCreated: "2020-06-30T15:59:37.956Z",
        objectUpdated: "2020-06-30T15:59:37.956Z",
        objectId: "8de56b4431694e80926aaf349a64a2ae",
        status: "DELIVERED",
        statusDetails: "Delivered",
        statusDate: "2020-06-30T15:01:13Z",
        substatus: {
          code: "delivered",
          text: "Package has been delivered.",
          actionRequired: false,
        },
        location: { city: "Kearny", state: "NJ", zip: "07032", country: "US" },
      },
    ],
    transaction: "FILL_IN",
    test: false,
  },
  event: "track_updated",
}

const DeliveryScheduledEvent = {
  test: false,
  data: {
    messages: [],
    carrier: "ups",
    trackingNumber: "1Z73662R0391683650",
    addressFrom: {
      city: "Kearny",
      state: "NJ",
      zip: "07032",
      country: "US",
    },
    addressTo: {
      city: "New York City",
      state: "NY",
      zip: "10003",
      country: "US",
    },
    eta: "2020-06-27T04:00:00Z",
    originalEta: "2020-06-26T04:00:00Z",
    servicelevel: {
      token: "ups_ground",
      name: "Ground",
    },
    metadata: null,
    trackingStatus: {
      objectCreated: "2020-06-27T12:19:31.910Z",
      objectUpdated: "2020-06-27T12:19:31.910Z",
      objectId: "609753f43ef541359b3ad3b3631798e1",
      status: "TRANSIT",
      statusDetails: "Loaded on Delivery Vehicle",
      statusDate: "2020-06-27T09:09:05Z",
      substatus: {
        code: "out_for_delivery",
        text: "Package is out for delivery.",
        actionRequired: false,
      },
      location: {
        city: "New York",
        state: "NY",
        zip: "",
        country: "US",
      },
    },
    trackingHistory: [
      {
        objectCreated: "2020-06-25T21:58:14.916Z",
        objectUpdated: "2020-06-27T03:56:32.818Z",
        objectId: "8815ed39967e4f61ac1f40f9406321dd",
        status: "TRANSIT",
        statusDetails: "Origin Scan",
        statusDate: "2020-06-27T01:53:22Z",
        substatus: {
          code: "package_accepted",
          text:
            "Package has been accepted into the carrier network for delivery.",
          actionRequired: false,
        },
        location: {
          city: "New York",
          state: "NY",
          zip: "",
          country: "US",
        },
      },
      {
        objectCreated: "2020-06-27T03:56:32.818Z",
        objectUpdated: "2020-06-27T03:56:32.818Z",
        objectId: "4e91ae38158e48179ae6fc591c625635",
        status: "TRANSIT",
        statusDetails: "Departed",
        statusDate: "2020-06-27T02:04:00Z",
        substatus: {
          code: "package_departed",
          text:
            "Package has departed from an intermediate location in the carrier network.",
          actionRequired: false,
        },
        location: {
          city: "New York",
          state: "NY",
          zip: "",
          country: "US",
        },
      },
      {
        objectCreated: "2020-06-27T08:03:14.848Z",
        objectUpdated: "2020-06-27T08:03:14.848Z",
        objectId: "ca318d940370471cab968a2481443d79",
        status: "TRANSIT",
        statusDetails: "Arrived",
        statusDate: "2020-06-27T04:01:00Z",
        substatus: {
          code: "package_arrived",
          text:
            "Package has arrived at an intermediate location in the carrier network.",
          actionRequired: false,
        },
        location: {
          city: "New York",
          state: "NY",
          zip: "",
          country: "US",
        },
      },
      {
        objectCreated: "2020-06-27T12:19:31.910Z",
        objectUpdated: "2020-06-27T12:19:31.910Z",
        objectId: "4418b14a710c42dd894ce767795d1142",
        status: "TRANSIT",
        statusDetails: "Destination Scan",
        statusDate: "2020-06-27T08:36:42Z",
        substatus: {
          code: "delivery_scheduled",
          text: "Package is scheduled for delivery.",
          actionRequired: false,
        },
        location: {
          city: "New York",
          state: "NY",
          zip: "",
          country: "US",
        },
      },
      {
        objectCreated: "2020-06-27T12:19:31.910Z",
        objectUpdated: "2020-06-27T12:19:31.910Z",
        objectId: "6c59d5f8d821466988e81f70dee99a9d",
        status: "TRANSIT",
        statusDetails: "Loaded on Delivery Vehicle",
        statusDate: "2020-06-27T09:09:05Z",
        substatus: {
          code: "out_for_delivery",
          text: "Package is out for delivery.",
          actionRequired: false,
        },
        location: {
          city: "New York",
          state: "NY",
          zip: "",
          country: "US",
        },
      },
    ],
    transaction: "FILL_IN",
    test: false,
  },
  event: "track_updated",
}

const PackageDepartedEvent = {
  test: false,
  data: {
    messages: [],
    carrier: "ups",
    trackingNumber: "1Z73662R0391683650",
    addressFrom: {
      city: "Kearny",
      state: "NJ",
      zip: "07032",
      country: "US",
    },
    addressTo: {
      city: "New York City",
      state: "NY",
      zip: "10003",
      country: "US",
    },
    eta: "2020-06-27T04:00:00Z",
    originalEta: "2020-06-26T04:00:00Z",
    servicelevel: {
      token: "ups_ground",
      name: "Ground",
    },
    metadata: null,
    trackingStatus: {
      objectCreated: "2020-06-27T03:56:32.818Z",
      objectUpdated: "2020-06-27T03:56:32.818Z",
      objectId: "e78d060bb3ab49ebb64b33fdf806d2ca",
      status: "TRANSIT",
      statusDetails: "Departed",
      statusDate: "2020-06-27T02:04:00Z",
      substatus: {
        code: "package_departed",
        text:
          "Package has departed from an intermediate location in the carrier network.",
        actionRequired: false,
      },
      location: {
        city: "New York",
        state: "NY",
        zip: "",
        country: "US",
      },
    },
    trackingHistory: [
      {
        objectCreated: "2020-06-25T21:58:14.916Z",
        objectUpdated: "2020-06-27T03:56:32.818Z",
        objectId: "fcaf8e0ce9ba4b8984d3ce47db6e297e",
        status: "TRANSIT",
        statusDetails: "Origin Scan",
        statusDate: "2020-06-27T01:53:22Z",
        substatus: {
          code: "package_accepted",
          text:
            "Package has been accepted into the carrier network for delivery.",
          actionRequired: false,
        },
        location: {
          city: "New York",
          state: "NY",
          zip: "",
          country: "US",
        },
      },
      {
        objectCreated: "2020-06-27T03:56:32.818Z",
        objectUpdated: "2020-06-27T03:56:32.818Z",
        objectId: "13410a65fb6440a4a14a091d8ec47446",
        status: "TRANSIT",
        statusDetails: "Departed",
        statusDate: "2020-06-27T02:04:00Z",
        substatus: {
          code: "package_departed",
          text:
            "Package has departed from an intermediate location in the carrier network.",
          actionRequired: false,
        },
        location: {
          city: "New York",
          state: "NY",
          zip: "",
          country: "US",
        },
      },
    ],
    transaction: "FILL_IN",
    test: false,
  },
  event: "track_updated",
}

const PackageArrivedEvent = {
  test: false,
  data: {
    messages: [],
    carrier: "ups",
    trackingNumber: "1Z73662R0391683650",
    addressFrom: {
      city: "Kearny",
      state: "NJ",
      zip: "07032",
      country: "US",
    },
    addressTo: {
      city: "New York City",
      state: "NY",
      zip: "10003",
      country: "US",
    },
    eta: "2020-06-27T04:00:00Z",
    originalEta: "2020-06-26T04:00:00Z",
    servicelevel: {
      token: "ups_ground",
      name: "Ground",
    },
    metadata: null,
    trackingStatus: {
      objectCreated: "2020-06-27T08:03:14.848Z",
      objectUpdated: "2020-06-27T08:03:14.848Z",
      objectId: "276b143f52b24f9183e9908bdd6d97f1",
      status: "TRANSIT",
      statusDetails: "Arrived",
      statusDate: "2020-06-27T04:01:00Z",
      substatus: {
        code: "package_arrived",
        text:
          "Package has arrived at an intermediate location in the carrier network.",
        actionRequired: false,
      },
      location: {
        city: "New York",
        state: "NY",
        zip: "",
        country: "US",
      },
    },
    trackingHistory: [
      {
        objectCreated: "2020-06-25T21:58:14.916Z",
        objectUpdated: "2020-06-27T03:56:32.818Z",
        objectId: "9054ef5913c543238359f88731f91352",
        status: "TRANSIT",
        statusDetails: "Origin Scan",
        statusDate: "2020-06-27T01:53:22Z",
        substatus: {
          code: "package_accepted",
          text:
            "Package has been accepted into the carrier network for delivery.",
          actionRequired: false,
        },
        location: {
          city: "New York",
          state: "NY",
          zip: "",
          country: "US",
        },
      },
      {
        objectCreated: "2020-06-27T03:56:32.818Z",
        objectUpdated: "2020-06-27T03:56:32.818Z",
        objectId: "e76ce2cc6a68468bb80df897afcf4217",
        status: "TRANSIT",
        statusDetails: "Departed",
        statusDate: "2020-06-27T02:04:00Z",
        substatus: {
          code: "package_departed",
          text:
            "Package has departed from an intermediate location in the carrier network.",
          actionRequired: false,
        },
        location: {
          city: "New York",
          state: "NY",
          zip: "",
          country: "US",
        },
      },
      {
        objectCreated: "2020-06-27T08:03:14.848Z",
        objectUpdated: "2020-06-27T08:03:14.848Z",
        objectId: "0b39a35a850e4fec8f2127be27b4eb66",
        status: "TRANSIT",
        statusDetails: "Arrived",
        statusDate: "2020-06-27T04:01:00Z",
        substatus: {
          code: "package_arrived",
          text:
            "Package has arrived at an intermediate location in the carrier network.",
          actionRequired: false,
        },
        location: {
          city: "New York",
          state: "NY",
          zip: "",
          country: "US",
        },
      },
    ],
    transaction: "FILL_IN",
    test: false,
  },
  event: "track_updated",
}

const PackageAcceptedEvent = {
  test: false,
  data: {
    messages: [],
    carrier: "ups",
    trackingNumber: "1Z73662R0328627213",
    addressFrom: {
      city: "Kearny",
      state: "NJ",
      zip: "07032",
      country: "US",
    },
    addressTo: {
      city: "New York",
      state: "NY",
      zip: "10007",
      country: "US",
    },
    eta: "2021-08-14T04:00:00Z",
    originalEta: "2021-08-14T04:00:00Z",
    servicelevel: {
      token: "ups_ground",
      name: "Ground",
    },
    metadata: null,
    trackingStatus: {
      objectCreated: "2021-08-12T16:59:41.228Z",
      objectUpdated: "2021-08-14T02:45:47.369Z",
      objectId: "94850588aa2e4067b0322e91be28a63c",
      status: "TRANSIT",
      statusDetails: "Origin Scan",
      statusDate: "2021-08-14T01:43:20Z",
      substatus: {
        code: "package_accepted",
        text:
          "Package has been accepted into the carrier network for delivery.",
        actionRequired: false,
      },
      location: {
        city: "Secaucus",
        state: "NJ",
        zip: "",
        country: "US",
      },
    },
    trackingHistory: [
      {
        objectCreated: "2021-08-12T16:59:41.228Z",
        objectUpdated: "2021-08-14T02:45:47.369Z",
        objectId: "6c488a8325a54511adab67b9cb5b2dc0",
        status: "TRANSIT",
        statusDetails: "Origin Scan",
        statusDate: "2021-08-14T01:43:20Z",
        substatus: {
          code: "package_accepted",
          text:
            "Package has been accepted into the carrier network for delivery.",
          actionRequired: false,
        },
        location: {
          city: "Secaucus",
          state: "NJ",
          zip: "",
          country: "US",
        },
      },
    ],
    transaction: "FILL_IN",
    test: false,
  },
  event: "track_updated",
}

export const getEventsForTransactionId = txn_id => {
  const withTxnId = event => update(event, "data.transaction", () => txn_id)

  return {
    DeliveryScheduled: withTxnId(cloneDeep(DeliveryScheduledEvent)),
    PackageDeparted: withTxnId(cloneDeep(PackageDepartedEvent)),
    PackageArrived: withTxnId(cloneDeep(PackageArrivedEvent)),
    PackageAccepted: withTxnId(cloneDeep(PackageAcceptedEvent)),
    Delivered: withTxnId(cloneDeep(DeliveredEvent)),
  }
}
