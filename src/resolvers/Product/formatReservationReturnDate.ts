export const formatReservationReturnDate = (reservationCreatedAtDate: Date) => {
  const date = returnDate(reservationCreatedAtDate)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const returnDate = (reservationCreatedAtDate: Date) => {
  const returnDate = new Date(reservationCreatedAtDate)
  returnDate.setDate(reservationCreatedAtDate.getDate() + 30)
  return returnDate
}
