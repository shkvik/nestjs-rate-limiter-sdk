import { LimitOverflow } from "./limitation";

/**
 * Base options shared by all custom limiter strategies.
 */
export class CustomLimitCommon {
  /**
   * Whether the limiter is enabled.
   * If false or undefined, the limiter is bypassed.
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * Behavior when a request exceeds the current limit.
   * Common values: REJECT (drop), WAIT (queue).
   *
   * @default LimitOverflow.REJECT
   */
  overflow?: LimitOverflow;
  /**
   * Maximum time to wait in milliseconds if overflow is set to WAIT.
   * If exceeded, the request is rejected.
   *
   * @example
   * timeout = 3000 // wait up to 3 seconds
   */
  timeout?: number;
}

/**
 * Options for a custom token bucket limiter.
 * Used when applying a cost-based consumption model.
 */
export class CustomTokenBucketOpts extends CustomLimitCommon {
   /**
   * Optional cost of the operation.
   * Defaults to 1 token per call if not specified.
   *
   * @example
   * cost = 5 // consume 5 tokens for this action
   */
  cost?: number;
}

/**
 * Options for a custom fixed window limiter.
 * Inherits all common options from CustomLimitCommon.
 */
export class CustomFixedWindowOpts extends CustomLimitCommon {}

/**
 * Options for a custom timed queue limiter.
 * Enforces a fixed interval between actions.
 */
export class CustomTimedQueueOpts extends CustomLimitCommon {
  /**
   * Minimum interval (in milliseconds) between allowed executions.
   *
   * @example
   * interval = 1000 // allow one call per second
   */
  interval?: number;
}

export type CustomLimitOpts =
  | CustomLimitCommon
  | CustomTokenBucketOpts
  | CustomFixedWindowOpts
  | CustomTimedQueueOpts;
