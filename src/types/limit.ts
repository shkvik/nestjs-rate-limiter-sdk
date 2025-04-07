import { RateLimitation, LimitOverflow } from "./limitation";

export class LimitCommon {
  limitation?: RateLimitation;
  overflow?: LimitOverflow;
  key?: string;
}

export class LimitTokenBucketOpts extends LimitCommon {
  capacity: number;
  refill: number;
  timeout?: number;
}

export class LimitFixedWindowOpts extends LimitCommon {
  limit: number;
  window: number;
  timeout?: number;
}

export class LimitTimedQueueOpts extends LimitCommon {
  interval: number;
}

export type LimitOpts =
  | LimitCommon
  | LimitTokenBucketOpts
  | LimitFixedWindowOpts
  | LimitTimedQueueOpts;
