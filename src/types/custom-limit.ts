import { LimitOverflow, RateLimitation } from "./limitation";

export class CustomLimitCommon {
  enabled?: boolean;
  overflow?: LimitOverflow;
  timeout?: number;
}

export class CustomTokenBucketOpts extends CustomLimitCommon {
  cost?: number;
}

export class CustomFixedWindowOpts extends CustomLimitCommon {}

export class CustomTimedQueueOpts extends CustomLimitCommon {
  interval?: number;
}

export type CustomLimitOpts =
  | CustomLimitCommon
  | CustomTokenBucketOpts
  | CustomFixedWindowOpts
  | CustomTimedQueueOpts;
