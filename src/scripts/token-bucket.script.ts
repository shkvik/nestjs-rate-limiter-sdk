export const TOKEN_BUCKET_SCRIPT = `
local key = KEYS[1]
local requested = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local refill_interval = tonumber(ARGV[3])

local time = redis.call("TIME")
local now = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)

local data = redis.call("HMGET", key, "tokens", "last_refill_ts")
local tokens = tonumber(data[1])
local last_refill_ts = tonumber(data[2])

if tokens == nil or last_refill_ts == nil then
  tokens = capacity
  last_refill_ts = now - (now % refill_interval)
end

local current_refill_ts = now - (now % refill_interval)
if current_refill_ts > last_refill_ts then
  tokens = capacity
  last_refill_ts = current_refill_ts
end

local next_refill_ts = last_refill_ts + refill_interval
local time_until_refill = math.max(0, next_refill_ts - now)

if tokens >= requested then
  tokens = tokens - requested
  redis.call("HMSET", key, "tokens", tokens, "last_refill_ts", last_refill_ts)
  redis.call("PEXPIRE", key, refill_interval * 2)
  return {1, tokens, time_until_refill}
else
  redis.call("HMSET", key, "tokens", tokens, "last_refill_ts", last_refill_ts)
  redis.call("PEXPIRE", key, refill_interval * 2)
  return {0, tokens, time_until_refill}
end
`;
