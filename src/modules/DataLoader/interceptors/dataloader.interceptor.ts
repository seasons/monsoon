import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { GqlExecutionContext, GraphQLExecutionContext } from "@nestjs/graphql"
import DataLoader from "dataloader"
import { isUndefined } from "lodash"
import { Observable } from "rxjs"

import {
  DataloaderContext,
  LoaderParams,
  NestDataLoader,
} from "../dataloader.types"

@Injectable()
export class DataLoaderInterceptor implements NestInterceptor {
  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * @inheritdoc
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const graphqlExecutionContext: GraphQLExecutionContext = GqlExecutionContext.create(
      context
    )
    const ctx: DataloaderContext = graphqlExecutionContext.getContext()

    if (isUndefined(ctx.dataloaders)) {
      ctx.dataloaders = new Map()
      ctx.getDataLoader = ({
        name,
        type,
        params = null,
      }: LoaderParams): DataLoader<any, any> => {
        if (!ctx.dataloaders.has(name)) {
          try {
            const loader = this.moduleRef.get<NestDataLoader>(type, {
              strict: false,
            })
            ctx.dataloaders.set(name, loader.generateDataLoader(params))
          } catch (e) {
            throw new InternalServerErrorException(
              `The loader ${type} is not provided`
            )
          }
        }

        return ctx.dataloaders.get(name)
      }
    }

    return next.handle()
  }
}
