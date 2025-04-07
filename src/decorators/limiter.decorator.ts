import {
  CustomLimitOpts,
  LimitFixedWindowOpts,
  LimitOpts,
  LimitTimedQueueOpts,
  LimitTokenBucketOpts,
  RateLimitation,
} from "../types";

export const RATE_LIMIT_META_KEY = "custom:rate-limit";

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

export const UseCustomLimit = (opts: CustomLimitOpts): MethodDecorator => {
  return <T>(
    _: object,
    __: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    Reflect.defineMetadata(RATE_LIMIT_META_KEY, opts, descriptor.value);
  };
};
