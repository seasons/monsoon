import { PrismaSyncService } from "../modules/Sync/services/sync.prisma.service"
import { AuthService } from "../modules/User/services/auth.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const auth = new AuthService(ps, null, null, null, null, null)
  const pas = new PrismaSyncService(auth)

  // pas.
}
