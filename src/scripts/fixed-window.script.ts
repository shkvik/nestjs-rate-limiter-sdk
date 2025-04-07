export const FIXED_WINDOW_SCRIPT = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])

local time = redis.call("TIME")
local now = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)
local window_start = now - (now % window)
local window_key = key .. ":" .. window_start
local current = redis.call("INCR", window_key)

if current == 1 then
  redis.call("PEXPIRE", window_key, window)
end

local ttl = redis.call("PTTL", window_key)

if current <= limit then
  return {1, current, ttl}
else
  return {0, current, ttl}
end
`;
