import { UseLimit } from "src/decorators";
import { RateLimitation } from "src/types";

@UseLimit({
  limitation: RateLimitation.TOKEN_BUCKET
})
export class TokenBucketDefault {
  regular(): string {
    return "regular";
  }
}

@UseLimit({
  limitation: RateLimitation.FIXED_WINDOW,
  capacity: 10,
})
export class TokenBucketCapacity {
  capacity(): string {
    return "capacity";
  }
}

@UseLimit({
  limitation: RateLimitation.FIXED_WINDOW,
  refill: 1000,
})
export class TokenBucketRefill {
  refill(): string {
    return "refill";
  }
}

@UseLimit({
  limitation: RateLimitation.FIXED_WINDOW,
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
