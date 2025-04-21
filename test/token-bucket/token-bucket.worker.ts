import { UseCustomLimit, UseLimit } from "src/decorators";
import { RateLimitation } from "src/types";

@UseLimit({
  limitation: RateLimitation.TOKEN_BUCKET
})
export class TokenBucketRegular {
  regular(): string {
    return "regular";
  }
}

@UseLimit({
  limitation: RateLimitation.TOKEN_BUCKET,
  capacity: 10,
})
export class TokenBucketCapacity {
  capacity(): string {
    return "capacity";
  }
}

@UseLimit({
  limitation: RateLimitation.TOKEN_BUCKET,
  refill: 1000,
})
export class TokenBucketRefill {
  refill(): string {
    return "refill";
  }
}

@UseLimit({
  limitation: RateLimitation.TOKEN_BUCKET,
  timeout: 1000,
})
export class TokenBucketTimeout {
  timeout(): string {
    return "timeout";
  }
}

@UseLimit({
  limitation: RateLimitation.TOKEN_BUCKET
})
export class TokenBucketCost {
  @UseCustomLimit({ cost: 100 })
  cost(): string {
    return "cost";
  }
}
