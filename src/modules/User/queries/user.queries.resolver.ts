import { FindManyArgs } from "@app/decorators/findManyArgs.decorator"
import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { PrismaService } from "@modules/Prisma/prisma.service"
import { Logger } from "@nestjs/common"
import { Args, Info, Query, Resolver } from "@nestjs/graphql"

import { AdmissionsService } from "../services/admissions.service"

@Resolver()
export class UserQueriesResolver {
  private readonly logger = new Logger(`User`)

  constructor(
    private readonly prisma: PrismaService,
    private readonly admissions: AdmissionsService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  @Query()
  async user(
    @Args() args,
    @Select({
      withFragment: `fragment EnsureIdAndEmail on User {id email}`,
    })
    select
  ) {
    const _data = await this.prisma.client2.user.findUnique({
      select,
      where: { ...args.where },
    })
    return this.prisma.sanitizePayload(_data, "User")
  }

  @Query()
  async users(
    @FindManyArgs({
      withFragment: `fragment EnsureIdAndEmail on User {id email}`,
    })
    findManyArgs
  ) {
    return this.queryUtils.resolveFindMany(findManyArgs, "User")
  }

  @Query()
  async usersConnection(@Args() args, @Select() select) {
    return await this.queryUtils.resolveConnection({ ...args, select }, "User")
  }

  @Query()
  async zipcodeServiced(@Args() args, @Info() info) {
    const data = await this.admissions.zipcodeAllowed(args.zipcode)
    return data.pass
  }
}
