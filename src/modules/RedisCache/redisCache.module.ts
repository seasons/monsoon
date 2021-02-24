import { CacheModule, Module } from "@nestjs/common"
import * as redisStore from "cache-manager-redis-store"

import { RedisCacheService } from "./services/redisCache.service"

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async configService => ({
        store: redisStore,
        host: "localhost",
        port: 6379,
        ttl: 60,
      }),
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
