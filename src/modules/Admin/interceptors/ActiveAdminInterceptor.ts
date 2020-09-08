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

  loggerBlocked: boolean

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const graphqlExecutionContext: GraphQLExecutionContext = GqlExecutionContext.create(
      context
    )
    const ctx: ActiveAdminInterceptorContext = graphqlExecutionContext.getContext()

    if (ctx.isAdminAction) {
      // Ensure we're not colliding with another admin action by enforcing an empty ActiveAdminTable
      // Note that this technically *could* fail if we have three simultaneous queries. But the probability
      // of that is basically 0 until we get real big
      await this.updateLoggerBlocked()
      while (this.loggerBlocked) {
        // Sentry.captureMessage("") // log a message to sentry just for our awareness
        await this.sleep(200)
        await this.updateLoggerBlocked()
      }

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

  async updateLoggerBlocked() {
    this.loggerBlocked =
      (await this.prisma.client.activeAdminUsers({})).length !== 0
  }

  async destroyActiveAdminRecordIfNeeded(ctx: ActiveAdminInterceptorContext) {
    if (ctx.isAdminAction) {
      // Use a many so we can query by the admin field. Should only be deleting 1 record though
      await this.prisma.client.deleteManyActiveAdminUsers({
        admin: { id: ctx.req.user.id },
      })
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
