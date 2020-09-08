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
}

@Injectable()
export class ActiveAdminInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const graphqlExecutionContext: GraphQLExecutionContext = GqlExecutionContext.create(
      context
    )
    const ctx: ActiveAdminInterceptorContext = graphqlExecutionContext.getContext()

    if (ctx.isAdminAction) {
      console.log(`Before execution, set up an ActiveAdmin record`)
    } else {
      console.log(`Before execution, do nothing`)
    }
    return next
      .handle()
      .pipe(tap(() => this.destroyActiveAdminRecordIfNeeded(ctx.isAdminAction)))
  }

  destroyActiveAdminRecordIfNeeded(isAdminAction: boolean) {
    if (isAdminAction) {
      console.log(`After execution, destroy active admin record`)
    } else {
      console.log(`After execution, do nothing`)
    }
  }
}
