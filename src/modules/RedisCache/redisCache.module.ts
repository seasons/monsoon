import { CacheModule, Module } from "@nestjs/common"
import * as redisStore from "cache-manager-redis-store"

import { RedisCacheService } from "./services/redisCache.service"

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async configService => ({
        store: redisStore,
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6789,
        ttl: process.env.CACHE_MAX_AGE || 60,
      }),
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
