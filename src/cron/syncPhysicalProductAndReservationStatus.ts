import { syncReservationStatus } from "./syncReservationStatus"
import { syncPhysicalProductStatus } from "./syncPhysicalProductStatus"

/*
Syncing reservation status requires that we first sync physical product status.
*/

export async function syncPhysicalProductAndReservationStatus(
  event,
  context,
  callback
) {
  const physProdReport = await syncPhysicalProductStatus()
  const reservationReport = await syncReservationStatus()
  const allErrors = [...physProdReport.errors, ...reservationReport.errors]
  console.log({ ...physProdReport, ...reservationReport, errors: allErrors })
  return { ...physProdReport, ...reservationReport, errors: allErrors }
}

syncPhysicalProductAndReservationStatus(null, null, null)
