import { User } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { GqlExecutionContext, GraphQLExecutionContext } from "@nestjs/graphql"
import { Observable } from "rxjs"
import { tap } from "rxjs/operators"

interface ActiveAdminInterceptorContext {
  isAdminAction: boolean
  req: { user: User }
}

@Injectable()
export class ActiveAdminInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const graphqlExecutionContext: GraphQLExecutionContext = GqlExecutionContext.create(
      context
    )
    const ctx: ActiveAdminInterceptorContext = graphqlExecutionContext.getContext()

    if (ctx.isAdminAction) {
      await this.prisma.client.createActiveAdminUser({
        admin: { connect: { id: ctx.req.user.id } },
      })
    }

    return next.handle().pipe(
      tap(async () => {
        await this.destroyActiveAdminRecordIfNeeded(ctx)
      })
    )
  }

  async destroyActiveAdminRecordIfNeeded(ctx: ActiveAdminInterceptorContext) {
    if (ctx.isAdminAction) {
      // Use a many so we can query by the admin field. Should only be deleting 1 record though
      await this.prisma.client.deleteManyActiveAdminUsers({
        admin: { id: ctx.req.user.id },
      })
    }
  }
}
