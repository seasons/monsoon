import { SegmentService } from "@app/modules/Analytics/services/segment.service"
import { User } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { GqlExecutionContext, GraphQLExecutionContext } from "@nestjs/graphql"
import { pick } from "lodash"
import { Observable } from "rxjs"
import { tap } from "rxjs/operators"

interface ActiveAdminInterceptorContext {
  // The query/mutation in consideration includes "Admin" in its list of eligible roles
  isAdminAction: boolean

  // The user executing the query or mutation has the Admin role
  activeUserIsAdmin: boolean

  // The active request is a mutation
  isMutation: boolean

  req: { user: User }
}

@Injectable()
export class ActiveAdminInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly segment: SegmentService
  ) {}

  // true if there's another admin action happening. We know this if there's a record
  // in the ActiveAdmin table. False otherwise.
  loggerBlocked: boolean

  // How many milliseconds to wait before trying to advance up the queue
  pollInterval: number = 200

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const graphqlExecutionContext: GraphQLExecutionContext = GqlExecutionContext.create(
      context
    )
    const ctx: ActiveAdminInterceptorContext = graphqlExecutionContext.getContext()

    let numPolls = 0
    if (ctx.isAdminAction && ctx.isMutation && ctx.activeUserIsAdmin) {
      console.log("**** WE RUN ACTIVE ADMIN TABLE CODE IN INTERCEPT **")
      // Ensure we're not colliding with another admin action by enforcing an empty ActiveAdminTable
      // Note that this technically *could* fail if we have three simultaneous queries. But the probability
      // of that is basically 0 until we get real big
      await this.updateLoggerBlocked()
      while (this.loggerBlocked) {
        if (numPolls === 0) {
          this.segment.track(ctx.req.user.id, "Entered Active Admin Queue", {
            ...pick(ctx.req.user, ["firstName", "lastName", "email"]),
          })
        }

        await this.sleep(this.pollInterval)
        await this.updateLoggerBlocked()

        numPolls++

        if (numPolls * this.pollInterval > 5000) {
          throw new Error("Timed out after 5 seconds in queue")
        }
      }
      if (numPolls > 0) {
        this.segment.track(ctx.req.user.id, "Exited Active Admin Queue", {
          ...pick(ctx.req.user, ["firstName", "lastName", "email"]),
          numPolls,
          pollInterval: this.pollInterval,
        })
      }

      await this.prisma.client.createActiveAdminUser({
        admin: { connect: { id: ctx.req.user.id } },
      })
    }

    const cleanup = async () => {
      await this.destroyActiveAdminRecordIfNeeded(ctx)
    }
    return next.handle().pipe(
      tap(
        // no next observable
        null,
        // if error, cleanup
        cleanup,
        // if success, cleanup
        cleanup
      )
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
