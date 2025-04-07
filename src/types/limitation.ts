export enum RateLimitation {
  TOKEN_BUCKET,
  FIXED_WINDOW,
  TIMED_QUEUE,
}

export enum LimitOverflow {
  REJECT,
  WAIT,
}
