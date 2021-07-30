import { UtilsService } from "@app/modules/Utils/services/utils.service"
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { GqlExecutionContext, GraphQLExecutionContext } from "@nestjs/graphql"
import { Observable } from "rxjs"
import { tap } from "rxjs/operators"

@Injectable()
// TODO: Ensure this runs before ActiveAdminInterceptor
export class IsMutationInterceptor implements NestInterceptor {
  constructor(private readonly utils: UtilsService) {
    this.persistedQueryMap = this.utils.parseJSONFile(
      "src/modules/test/complete.queryMap"
    )
  }

  private persistedQueryMap: any

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const graphqlExecutionContext: GraphQLExecutionContext = GqlExecutionContext.create(
      context
    )
    const ctx = graphqlExecutionContext.getContext()

    let queryString
    const isPersistedQuery = !ctx.req.body.query
    if (isPersistedQuery) {
      const opName = ctx.req.query.operationName
      queryString = this.persistedQueryMap[opName]
    } else {
      queryString = ctx.req.body.query
    }
    const isMutation = queryString.includes("mutation")

    ctx["isMutation"] = isMutation

    return next.handle().pipe(
      tap(
        // no next observable
        null,
        // if error, no op
        null,
        // if success, no op
        null
      )
    )
  }
}
