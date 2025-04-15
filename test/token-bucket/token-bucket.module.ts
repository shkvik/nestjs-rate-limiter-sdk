import { Module } from "@nestjs/common";
import { TokenBucketController } from "./token-bucket.controller";
import { 
  TokenBucketCapacity, 
  TokenBucketCost, 
  TokenBucketRegular, 
  TokenBucketRefill, 
  TokenBucketTimeout
} from "./token-bucket.worker";

@Module({
  providers: [
    TokenBucketRegular,
    TokenBucketCapacity,
    TokenBucketRefill,
    TokenBucketTimeout,
    TokenBucketCost,
  ],
  controllers: [TokenBucketController],
})
export class TokenBucketModule { }
