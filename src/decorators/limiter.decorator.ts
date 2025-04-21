import {
  CustomLimitOpts,
  LimitFixedWindowOpts,
  LimitOpts,
  LimitTimedQueueOpts,
  LimitTokenBucketOpts,
  RateLimitation,
} from "../types";

export const RATE_LIMIT_META_KEY = "custom:rate-limit";

/**
 * Class-level decorator that applies a rate limiting strategy
 * to all methods within the class unless overridden at method level.
 * 
 * By default, uses the Timed Queue strategy with a 1-second delay between calls.
 * 
 * The limiter logic is resolved based on metadata provided by
 * the class (e.g. via DI) or via default limiter strategy configuration.
 *
 * @note This decorator can only be applied to classes, not individual methods.
 * 
 * @see [Rate Limiter SDK](https://github.com/shkvik/nestjs-rate-limiter-sdk)
 * @publicApi
 */
export const UseLimit = (opts?: LimitOpts): ClassDecorator => {
  return <TFunction extends Function>(target: TFunction) => {
    if (opts?.limitation === RateLimitation.TIMED_QUEUE || !opts) {
      opts ||= new LimitTimedQueueOpts();
      Object.setPrototypeOf(opts, LimitTimedQueueOpts.prototype);
    }
    if (opts?.limitation === RateLimitation.TOKEN_BUCKET) {
      Object.setPrototypeOf(opts, LimitTokenBucketOpts.prototype);
    }
    if (opts?.limitation === RateLimitation.FIXED_WINDOW) {
      Object.setPrototypeOf(opts, LimitFixedWindowOpts.prototype);
    }
    Reflect.defineMetadata(RATE_LIMIT_META_KEY, opts, target);
  };
};

/**
 * Method decorator that applies a custom rate limiting strategy
 * to a specific method.
 *
 * The limiter configuration is provided via the `opts` parameter,
 * which supports token bucket, fixed window, or timed queue strategies.
 *
 */
export const UseCustomLimit = (opts: CustomLimitOpts): MethodDecorator => {
  return <T>(
    _: object,
    __: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    Reflect.defineMetadata(RATE_LIMIT_META_KEY, opts, descriptor.value);
  };
};
