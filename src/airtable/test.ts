var Airtable = require('airtable')
var base = new Airtable({ apiKey: 'key5jLbpSewBdphPB' }).base(
    'appC2SIyaxw5nPsDx'
)

// console.log(
//   base('Users').create({
//     Email: 'fai@seasons.nyc',
//     'First Name': 'Fai',
//     'Last Name': 'Rahman',
//     Status: 'Waitlisted',
//     'Full Name': 'Luc Succes',
//     'Phone Number': '(516) 610-0494',
//     'Shipping Address': ['recf5xFD1KhCBCRi3'],
//     'Platform OS': 'Other',
//     Birthday: '1990-08-17',
//     Height: 70,
//     Weight: '170',
//     'Body Type': 'Athletic',
//     'Average Pant Length': '30.0',
//     'Preferred Pronouns': 'he/him',
//     Profession: 'Technology'
//   })
// )

base('Users')
    .find({ Email: 'fai@seasons.nyc' })
    .then(resp => console.log(resp))
    .catch(err => console.log(err))

// export const getUserById: (
//     UserCreateInput
// ) => Promise<{ id: string }> = user => {
//     return new Promise((resolve, reject) => {
//         base("Users")
//             .select({
//                 view: "Grid view",
//                 filterByFormula: `{Email}='${user.email}'`,
//             })
//             .firstPage((err, records) => {
//                 if (records.length > 0) {
//                     const user = records[0]
//                     resolve(user)
//                 } else {
//                     reject(err)
//                 }
//             })
//     })
// }

// getUserById({ email: 'fai@seasons.nyc' })
//     .then(resp => console.log(resp))
//     .catch(err => console.log(err))
