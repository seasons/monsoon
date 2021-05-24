import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"
import { PrismaService } from "@prisma1/prisma.service"

@Resolver()
export class SizeQueriesResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query()
  async bottomSize(@Args() args, @Select() select) {
    const data = await this.prisma.client2.bottomSize.findUnique({
      ...select,
      ...args,
    })

    const sanitizedData = this.prisma.sanitizePayload(data, "BottomSize")

    return sanitizedData
  }

  @Query()
  async bottomSizes(@FindManyArgs() args, @Select() select) {
    const data = await this.prisma.client2.bottomSize.findMany({
      ...args,
      ...select,
    })
    const sanitizedData = this.prisma.sanitizePayload(data, "BottomSize")

    return sanitizedData
  }

  @Query()
  async topSize(@Args() args, @Select() select) {
    const data = await this.prisma.client2.topSize.findUnique({
      ...select,
      ...args,
    })

    const sanitizedData = this.prisma.sanitizePayload(data, "TopSize")

    return sanitizedData
  }

  @Query()
  async topSizes(@FindManyArgs() args, @Select() select) {
    const data = await this.prisma.client2.topSize.findMany({
      ...args,
      ...select,
    })
    const sanitizedData = this.prisma.sanitizePayload(data, "TopSize")

    return sanitizedData
  }

  @Query()
  async size(@Args() args, @Select() select) {
    const data = await this.prisma.client2.size.findUnique({
      ...select,
      ...args,
    })

    const sanitizedData = this.prisma.sanitizePayload(data, "Size")

    return sanitizedData
  }

  @Query()
  async sizes(@FindManyArgs() args, @Select() select) {
    const data = await this.prisma.client2.size.findMany({
      ...args,
      ...select,
    })
    const sanitizedData = this.prisma.sanitizePayload(data, "Size")

    return sanitizedData
  }

  @Query()
  async sizesConnection(
    @Args() args,
    @FindManyArgs() { where, orderBy },
    @Select() select
  ) {
    // TODO: Need to sanitize the edges
    const result = await findManyCursorConnection(
      args =>
        this.prisma.client2.size.findMany({
          ...args,
          ...select,
          where,
          orderBy,
        }),
      () => this.prisma.client2.size.count({ where }),
      { ...args }
    )
    const sanitizedResult = this.prisma.sanitizeConnection(result)
    return sanitizedResult
  }
}
