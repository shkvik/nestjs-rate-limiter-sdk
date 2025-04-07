import { RateLimitation } from "./limitation";

export const getLimitation = (opts: object): RateLimitation => {
  if (Object.hasOwn(opts, "capacity")) {
    return RateLimitation.TOKEN_BUCKET;
  }
  if (Object.hasOwn(opts, "window")) {
    return RateLimitation.FIXED_WINDOW;
  }
  if (Object.hasOwn(opts, "interval")) {
    return RateLimitation.TIMED_QUEUE;
  }
  throw new Error("error type of limitation");
};
