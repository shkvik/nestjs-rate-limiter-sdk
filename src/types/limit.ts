import { RateLimitation, LimitOverflow } from "./limitation";

export class LimitCommon {
  /**
   * Strategy of rate limitation
   */
  limitation?: RateLimitation;
  /**
   * Specific key in the Redis storage
   * @default `nestjs-ratelimiter:${class_name}`
   */
  key?: string;
}

/**
 * Options for the Token Bucket rate limiter.
 */
export class LimitTokenBucketOpts extends LimitCommon {
  /**
   * Maximum number of tokens that can be stored in the bucket.
   * The bucket cannot hold more tokens than this value.
   * 
   * Default value is 100.
   *
   * @example
   * capacity = 100 // the bucket can hold up to 100 tokens
   */
  capacity: number;
  /**
   * Time (in milliseconds) required to fully refill the bucket
   * from empty to full capacity.
   *
   * The refill rate is derived as: `capacity / refill` tokens per millisecond.
   * Default value is 60000 ms (1 min).
   *
   * @example
   * refill = 1000 // full refill occurs every 1 second
   */
  refill: number;
  /**
   * Behavior when a request exceeds the available tokens.
   * Common values: REJECT (drop), WAIT (delay).
   *  
   * @default LimitOverflow.WAIT
   */
  overflow?: LimitOverflow;
  /**
   * Maximum time (in milliseconds) to wait for tokens if `overflow` is WAIT.
   * If the timeout is exceeded, the request will be rejected.
   *
   * Default value is 600000 ms (10 min).
   * 
   * @example
   * timeout = 5000 // wait up to 5 seconds before rejecting
   */
  timeout?: number;
}

/**
 * Options for the Fixed Window rate limiter.
 */
export class LimitFixedWindowOpts extends LimitCommon {
  /**
   * Maximum number of allowed actions (requests) per time window.
   *
   * Default value is 100.
   * 
   * @example
   * limit = 100 // allow up to 100 requests per window
   */
  limit: number;
  /**
   * Time window duration in milliseconds.
   * The counter resets at the start of each window.
   *
   * @example
   * window = 60000 // 1-minute window
   */
  window: number;
   /**
   * Behavior when the number of requests exceeds the limit within the current window.
   * Typical values: REJECT (drop), WAIT (delay until next window).
   *
   * @default LimitOverflow.WAIT
   */
  overflow?: LimitOverflow;
  /**
   * Maximum time (in milliseconds) to wait for tokens if `overflow` is WAIT.
   * If the timeout is exceeded, the request will be rejected.
   *
   * Default value is 600000 ms (10 min).
   * 
   * @example
   * timeout = 5000 // wait up to 5 seconds before rejecting
   */
  timeout?: number;
}

export class LimitTimedQueueOpts extends LimitCommon {
  /**
   * Minimum interval (in milliseconds) between allowed actions.
   * Each request must wait at least this long after the previous one.
   * 
   * By default, uses the Timed Queue strategy with a 1-second delay between calls.
   * @example
   * interval = 200 // allow one request every 200 ms
   */
  interval: number;
}

export type LimitOpts =
  | LimitCommon
  | LimitTokenBucketOpts
  | LimitFixedWindowOpts
  | LimitTimedQueueOpts;
