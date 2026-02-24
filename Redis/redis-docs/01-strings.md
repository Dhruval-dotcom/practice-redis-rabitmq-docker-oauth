# Redis Strings - The Simplest Data Type

## What is it?
One key holds one value. Like a variable in JavaScript.
```
key → value
```

## Open redis-cli and try these:

```bash
redis-cli
```

### Basic SET and GET
```redis
SET greeting "Hello World"
GET greeting
# Output: "Hello World"
```

### Numbers (Redis treats them as strings but can do math)
```redis
SET visitors 0
INCR visitors        # visitors = 1
INCR visitors        # visitors = 2
INCR visitors        # visitors = 3
GET visitors         # "3"

DECR visitors        # visitors = 2
INCRBY visitors 10   # visitors = 12
DECRBY visitors 5    # visitors = 7
```

### Expiry (auto-delete after X seconds)
```redis
SET session "user123" EX 30    # expires in 30 seconds
TTL session                     # shows remaining seconds
# wait 30 seconds...
GET session                     # (nil) - gone!
```

### Set only if key does NOT exist
```redis
SET username "dhruval" NX       # sets it (key didn't exist)
SET username "someone" NX       # does nothing (key already exists)
GET username                    # "dhruval"
```

### Multiple keys at once
```redis
MSET city "Ahmedabad" country "India" lang "Gujarati"
MGET city country lang
# 1) "Ahmedabad"
# 2) "India"
# 3) "Gujarati"
```

### Check if key exists and delete it
```redis
EXISTS greeting    # 1 (yes)
DEL greeting       # 1 (deleted)
EXISTS greeting    # 0 (no)
GET greeting       # (nil)
```

## Real World Use Cases
- **Caching**: Store API response → `SET api:/users "json_data" EX 300`
- **Session**: Store user session → `SET session:abc123 "user_id" EX 3600`
- **Counter**: Page views → `INCR page:home:views`
- **Rate Limiting**: API calls → `INCR api:user123:calls` with expiry
