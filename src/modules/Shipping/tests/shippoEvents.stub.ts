export const DeliveryScheduled = {
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
    transaction: "cab8f46684034257ba8d72c58347fc26",
    test: false,
  },
  event: "track_updated",
}

export const PackageDeparted = {
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
    transaction: "cab8f46684034257ba8d72c58347fc26",
    test: false,
  },
  event: "track_updated",
}

export const PackageArrived = {
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
    transaction: "cab8f46684034257ba8d72c58347fc26",
    test: false,
  },
  event: "track_updated",
}
