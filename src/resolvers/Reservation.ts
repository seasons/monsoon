import { prisma } from "../prisma"

export const Reservation = {
  products(parent) {
    return prisma
      .reservation({
        id: parent.id,
      })
      .products()
  },
}
