# Useful Redis Commands to Know

## Key Management

```redis
# See all keys (careful in production - use SCAN instead)
KEYS *

# See keys matching a pattern
KEYS user:*

# Check what type a key is
TYPE user:1          # "hash"
TYPE tasks           # "list"
TYPE skills          # "set"

# Rename a key
RENAME oldkey newkey

# Set expiry on existing key (in seconds)
EXPIRE mykey 60       # expires in 60 seconds
TTL mykey             # check remaining time (-1 = no expiry, -2 = expired/gone)

# Remove expiry (make it permanent)
PERSIST mykey

# Delete everything (BE CAREFUL!)
FLUSHDB              # deletes all keys in current database
FLUSHALL             # deletes all keys in ALL databases
```

## Database Selection
Redis has 16 databases (0-15). Default is 0.

```redis
SELECT 1             # switch to database 1
SET test "hello"     # this key is only in database 1
SELECT 0             # switch back to database 0
GET test             # (nil) - not here!
```

## Server Info
```redis
INFO                 # everything about the server
INFO memory          # memory usage
INFO clients         # connected clients
DBSIZE               # number of keys in current database
```

## Quick Cheat Sheet

| Command | What it does |
|---------|-------------|
| `SET key value` | Store a string |
| `GET key` | Get a string |
| `DEL key` | Delete any key |
| `EXISTS key` | Check if key exists (1=yes, 0=no) |
| `EXPIRE key 60` | Auto-delete after 60 seconds |
| `TTL key` | Seconds until expiry |
| `TYPE key` | What data type is this key? |
| `KEYS *` | List all keys |
| `FLUSHDB` | Delete all keys (danger!) |
