## One time Product Variant Counts fix, 12.14.19

At time this document was written, last reservation was `24042`

1. `CRGR-BLU-LL-001`
   - Prisma: Total 2, Reserved 2, Reservable 0, nonReservable 0
   - Airtable: Total 2, Reserved 1, Reservable 1, nonReservable 0
   - Reservation History:
     - 46345 to Jett House
       - Both CRGR-BLU-LL-001 and CRGR-BLU-LL-002 were put on the reservation record. This is true on both airtable and prisma
       - Airtable Record URL: https://airtable.com/tblN3XRsRih4Rhlta/viw9wNFdZI0YcAjZv/recAMx1IMudcLQyke
       - **Question**: Which physical product was actually sent to Jett? Jett still has the products, right?
   - **Suggested Actions to fix data**:
     - Adjust reservation records on prisma/airtable to include only the physical product actually sent to Jett
     - Fix the count in prisma to be 2 total, 1 reserved, 1 reservable, 0 nonReservable.
     - Ensure the statuses on the physical products are as they should be.
2. `CAVE-ORG-SS-005`
   - Prisma: Total 1, Reserved 0, Reservable 1, nonReservable 0
   - Airtable: Total 1, Reserved 1, Reservable 0, nonReservable 0
   - Reservation History:
     - Never reserved.
   - Seems like data just got messed up on airtable somehow
   - **Suggested actions to fix data**:
     - Adjust Airtable counts to be Total 1, Reserved 0, Reservable 1, nonReservable 0. Adjust corresponding physical product status if needed on airtable.
3. `STIS-BLK-MM-008`
   - Prisma: Total 1, Reserved 1, Reservable 0, nonReservable 0
   - Airtable: Total 1, Reserved 0, Reservable 1, nonReservable 0
   - Reservation History:
     - 46345 to Jett House
       - Looks like airtable count is simply incorrect.
   - **Suggested actions to fix data**:
     - Adjust Airtable counts to match Prisma.
4. `STIS-ORG-LL-009`
   - Prisma: Total 1, Reserved 1, Reservable 0, nonReservable: 0
   - Airtable: Total 1, Reserved 0, Reservable 1, nonReservable 0
   - Reservation History:
     - 46345 to Jett House
       - Looks like airtable count is simply incorrect.
   - **Suggested actions to fix data**:
     - Adjust Airtable counts to match Prisma.
