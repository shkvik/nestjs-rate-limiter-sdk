import { Module } from "@nestjs/common";
import { TokenBucketController } from "./token-bucket.controller";
import { 
  TokenBucketCapacity, 
  TokenBucketCost, 
  TokenBucketDefault, 
  TokenBucketRefill, 
  TokenBucketTimeout
} from "./token-bucket.worker";

@Module({
  providers: [
    TokenBucketDefault,
    TokenBucketCapacity,
    TokenBucketRefill,
    TokenBucketTimeout,
    TokenBucketCost,
  ],
  controllers: [TokenBucketController],
})
export class TokenBucketModule { }
