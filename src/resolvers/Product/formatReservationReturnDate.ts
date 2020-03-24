export const formatReservationReturnDate = (reservationCreatedAtDate: Date) => {
  const date = returnDate(reservationCreatedAtDate)
  const display = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  console.log("display", display)
  return display
}

export const returnDate = (reservationCreatedAtDate: Date) => {
  const returnDate = new Date(reservationCreatedAtDate)
  returnDate.setDate(reservationCreatedAtDate.getDate() + 30)
  return returnDate
}
