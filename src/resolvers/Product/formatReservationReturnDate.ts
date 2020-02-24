export const formatReservationReturnDate = (reservationCreatedAtDate: Date) => {
  const returnDate = new Date(reservationCreatedAtDate)
  returnDate.setDate(reservationCreatedAtDate.getDate() + 30)
  return returnDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
