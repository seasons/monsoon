# Queries

## 1. Me

```graphql

```

## 2. brand

```graphql

```

## 3. brands

```graphql

```

## 4. products

```graphql

```

## 5. productsConnection

```graphql

```

## 6. collectionGroups

```graphql

```

## 7. collectionGroup

```graphql

```

## 8. collections

```graphql

```

## 9. collection

```graphql

```

## 10. faq

```graphql

```

## 11. homepage

```graphql

```

## 12. chargebeeCheckout

```graphql

```

## 13. chargebeeUpdatePaymentPage

```graphql

```

## 14. homepageProductRail

```graphql

```

## 15. homepageProductRails

```graphql

```

## 16. product

```graphql

```

## 17. productVariant

```graphql

```

## 18. categories

```graphql

```

## 19. productFunctions

```graphql

```

## 20. productRequests

```graphql

```

## 21. search

```graphql

```

# Mutations
## NOTE: 
`<Token>` can be acquired using the `login` mutation

## 1. beamsData

```graphql
mutation {
  beamsData {
    email
    beamsToken
  }
}
```
### Required HTTP Headers:
```JSON
{
  "authorization": "Bearer <token>"
}
```

## 2. signup

```graphql
mutation Signup(
  $email: String!,
  $details: CustomerDetailCreateInput,
  $firstName: String!,
	$lastName: String!,
  $password: String!
) {
  signup(
    email: $email,
    details: $details,
    firstName: $firstName,
    lastName: $lastName,
    password: $password
  ) {
    user {
      firstName
      lastName
    }
  }
}
```
### Required query variables:
```JSON
{
  "email": <new & valid email>,
  "details": {
    "phoneNumber": "503-799-1641",
    "birthday": "1990-08-18T00:00:00.000Z",
    "height": 70,
    "weight": "170-180 lbs",
    "bodyType": "Athletic",
    "averageTopSize": "M",
    "averageWaistSize": "32",
    "averagePantLength": "30",
    "preferredPronouns": "he/him",
    "profession": "Technology",
    "partyFrequency": "Too often to admit",
    "travelFrequency": "0 - 1 times a year",
    "shoppingFrequency": "Whenever I get the chance",
    "averageSpend": "$150 - $300 a month",
    "style": "Hypebeast",
    "phoneOS": "iOS",
    "shippingAddress": {
      "create": {
        "slug": "Fritz-Patrick-Kernizan-" + <unique number>,
        "name": "Fritz-Patrick Kernizan",
        "company": null,
        "description": "Customer Shipping Address",
        "address1": "118-43 224 Street",
        "address2": "",
        "city": "Cambria Heights",
        "state": "New York",
        "zipCode": "11411",
        "locationType": "Customer"
      }
    }
  },
  "firstName": "Omar",
  "lastName": "Rasheed",
  "password": <strong password>
}
```

## 3. login

```graphql
mutation Login(
  $email: String!,
  $password: String!
) {
  login(
    email: $email,
    password: $password
  ) {
    token
  }
}
```
### Required Query Variables:
```JSON
{
  "email": <email>,
  "password": <password>
}
```

## 4. resetPassword

```graphql
mutation ResetPassword($email: String!) {
  resetPassword(email: $email) {
    message
  }
}
```
### Required Query Variables:
```JSON
{
  "email": <email>
}
```

## 5. addCustomerDetails

```graphql
mutation AddCustomerDetails(
  $status: CustomerStatus,
  $event: Event
) {
  addCustomerDetails(
    details: {
    	birthday: "1990-08-18T00:00:00.000Z",
      height: 70,
      weight:  "170-180 lbs",
      bodyType: "Athletic",
      averageTopSize: "M",
      averageWaistSize: "32",
      averagePantLength: "30",
      preferredPronouns: "he/him",
      profession: "Technology",
      phoneOS: "iOS",
      partyFrequency: "Too often to admit",
      travelFrequency: "0 - 1 times a year",
      shoppingFrequency: "Whenever I get the chance",
      averageSpend: "$150 - $300 a month",
      style: "Hypebeast",
      shippingAddress: {
        create: {
          slug: "Fritz-Patrick-Kernizan-" + <unique number>,
          name: "Fritz-Patrick Kernizan",
          company: null,
          description: "Customer Shipping Address",
          address1: "118-43 224 Street",
          address2: "",
          city: "Cambria Heights",
          state: "New York",
          zipCode: "11411",
          locationType: Customer,
          user: {
            connect: {
              email: <user email>,
            },
          },
        },
      }
    }, 
    status: $status, 
    event: $event
  ) {
    detail {
      birthday
      height
      bodyType
    }
  }
}
```
### Required Query Variables:
```JSON
{
  "status": "Waitlisted",
  "event": "CompletedWaitlistForm"
}
```
### Required HTTP Headers:
```JSON
{
  "authorization": "Bearer <token>"
}
```


## 6. checkitemsAvailability

```graphql
mutation {
  checkItemsAvailability(items: ["ck76gntx8yrn307684a0vp0zp"])
}
```

## 7. reserveItems
```graphql

```

## 8. addToBag

```graphql
mutation AddToBag($item: ID!) {
  addToBag(item: $item) {
    saved
  }
}
```
### Required Query Variables:
```JSON
{
  "item": "ck2zeb50o0sg40734uiklm294"
}
```
### Required HTTP Headers:
```JSON
{
  "authorization": "Bearer <token>"
}
```

## 9. removeFromBag

```graphql
mutation RemoveFromBag($item: ID!) {
  removeFromBag(item: $item) {
    id
    saved
  }
}
```
### Required Query Variables:
```JSON
{
  "item": "ck2zeb50o0sg40734uiklm294"
}
```
### Required HTTP Headers:
```JSON
{
  "authorization": "Bearer <token>"
}
```

## 10. saveProduct

```graphql
mutation {
  saveProduct(
    item: "ck2zeb50o0sg40734uiklm294",
    save: true
  ) {
    id
  }
}
```
### Required HTTP Headers:
```JSON
{
  "authorization": "Bearer <token>"
}
```

## 11. addViewedProduct

```graphql
mutation {
  addViewedProduct(item: "ck7qhh1xl0dbo0735cql2khod") {
    id
    viewCount
  }
}
```
### Required HTTP Headers:
```JSON
{
  "authorization": "Bearer <token>"
}
```

## 12. acknowledgeCompletedChargebeeHostedCheckout

```graphql
mutation AcknowledgeCompletedChargebeeHostedCheckout($hostedPageID: String!) {
  acknowledgeCompletedChargebeeHostedCheckout(hostedPageID:$hostedPageID) {
		plan
  }
}
```
### Required Query Variables:
```JSON
{
  "hostedPageID": <page id>
}
```
### Required HTTP Headers:
```JSON
{
  "authorization": "Bearer <token>"
}
```

## 13. addProductRequest
```graphql
mutation {
  addProductRequest(
    reason: "Just cuz",
    url: "https://www.ssense.com/en-us/men/product/paul-smith-x-christoph-neimann/grey-phone-charger-print-hoodie/4941331"
  ) {
    id
    images
  }
}
```
### Required HTTP Headers:
```JSON
{
  "authorization": "Bearer <token>"
}
```

## 14. deleteProductRequest

```graphql
mutation DeleteProductRequest($requestID: ID!) {
  deleteProductRequest(requestID: $requestID) {
    images
  }
}
```
### Required Query Variables:
```JSON
{
  "requestID": <product request id>
}
```
### Required HTTP Headers:
```JSON
{
  "authorization": "Bearer <token>"
}
```

## 15. validateAddress

```graphql
mutation {
  validateAddress(
    input: {
      email: ""
      location: {
        slug: "Fritz-Patrick-Kernizan-1571222627123143123122123",
        name: "Fritz-Patrick Kernizan",
        company: null,
        description: "Customer Shipping Address",
        address1: "118-42 224 Street",
        address2: "",
        city: "Cambria Heights",
        state: "New York",
        zipCode: "11411",
        locationType: Customer,      
      }
    }
  ) {
    isValid
  }
}
```

## 16. addProductVariantWant

```graphql
mutation AddProductVariantWant($variantID: ID!) {
  addProductVariantWant(variantID: $variantID) {
    isFulfilled
    id
  }
}
```
### Required Query Variables:
```JSON
{
  "variantID": <product variant id>
}
```
### Required HTTP Headers:
```JSON
{
  "authorization": "Bearer <token>"
}
```

## 17. updateUserPushNotifications

```graphql
mutation {
  updateUserPushNotifications(pushNotificationsStatus: "Denied") {
    firstName
    pushNotifications
  }
}
```
### Required HTTP Headers:
```JSON
{
  "authorization": "Bearer <token>"
}
```

## 18. updatePaymentAndShipping

```graphql
mutation {
  updatePaymentAndShipping(billingAddress:{
    street1: "118-42 224 Street",
    city: "Cambria Heights",
    state: "New York",
    postalCode: "11411",
  }, phoneNumber: "5037991641", shippingAddress: {
    street1: "118-42 224 Streat",
    city: "Cambria Heights",
    state: "New York",
    postalCode: "11411",
  })
}
```
### Required HTTP Headers:
```JSON
{
  "authorization": "Bearer <token>"
}
```

# Webhooks

## 1. chargee_events
