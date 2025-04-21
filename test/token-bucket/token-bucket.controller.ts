import { Controller, Get, Inject } from "@nestjs/common";
import {
  TokenBucketCapacity,
  TokenBucketCost,
  TokenBucketRegular,
  TokenBucketRefill,
  TokenBucketTimeout
} from "./token-bucket.worker";

@Controller('token-bucket')
export class TokenBucketController {
  @Inject()
  private readonly tokenBucketWorker: TokenBucketRegular;

  @Inject()
  private readonly tokenBucketCapacity: TokenBucketCapacity;

  @Inject()
  private readonly tokenBucketRefill: TokenBucketRefill;

  @Inject()
  private readonly tokenBucketTimeout: TokenBucketTimeout;

  @Inject()
  private readonly tokenBucketCost: TokenBucketCost;

  @Get("regular")
  regular(): string {
    return this.tokenBucketWorker.regular();
  }

  @Get("capacity")
  capacity(): string {
    return this.tokenBucketCapacity.capacity();
  }

  @Get("refill")
  refill(): string {
    return this.tokenBucketRefill.refill();
  }

  @Get("timeout")
  timeout(): string {
    return this.tokenBucketTimeout.timeout();
  }

  @Get("cost")
  cost(): string {
    return this.tokenBucketCost.cost();
  }
}
