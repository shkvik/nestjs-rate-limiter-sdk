export const TIMED_QUEUE_SCRIPT = `
local key = KEYS[1]
local interval = tonumber(ARGV[1])

local time = redis.call("TIME")
local seconds = tonumber(time[1])
local microseconds = tonumber(time[2])
local curr = seconds * 1000 + math.floor(microseconds / 1000)

local last = tonumber(redis.call("GET", key) or tostring(curr))
local diff = last - curr

if diff >= 0 then
  last = last + interval
else
  last = curr + interval
end

redis.call("SET", key, tostring(last))

return diff > 0 and diff or 0
`;
