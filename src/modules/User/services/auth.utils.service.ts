import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"

@Injectable()
export class AuthUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  async isAdmin(user?: { id: string }) {
    if (!user) {
      return false
    }

    const roles = await this.prisma.client.user({ id: user.id }).roles()
    return roles.includes("Admin")
  }
}
