import { PrismaService } from "@app/prisma/prisma.service"
import { Body, Controller, Post } from "@nestjs/common"

interface SegmentEventContextApp {
  build: number
  version: string
}
interface SegmentEvent {
  context: { app: SegmentEventContextApp }
  userId: string
  type: string
}

@Controller("segment_events")
export class SegmentController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async handlePost(@Body() body: SegmentEvent) {
    if (body.type === "identify" && body.userId !== null) {
      const data = {
        iOSVersion: body.context.app.version,
      }
      await this.prisma.client.user.update({
        where: { id: body.userId },
        data: {
          deviceData: {
            upsert: {
              create: data,
              update: data,
            },
          },
        },
      })
    }
  }
}
