# Redis Lists - Ordered Collection

## What is it?
A list of values in order. Like an array in JavaScript.
You can push/pop from both LEFT (start) and RIGHT (end).

```
key → [value1, value2, value3, ...]
```

## Try these in redis-cli:

### Add items (LPUSH = left/start, RPUSH = right/end)
```redis
RPUSH tasks "Buy groceries"
RPUSH tasks "Clean room"
RPUSH tasks "Learn Redis"

# List is now: ["Buy groceries", "Clean room", "Learn Redis"]
```

### See all items (0 to -1 means start to end)
```redis
LRANGE tasks 0 -1
# 1) "Buy groceries"
# 2) "Clean room"
# 3) "Learn Redis"
```

### Add to the beginning
```redis
LPUSH tasks "Wake up early"
LRANGE tasks 0 -1
# 1) "Wake up early"
# 2) "Buy groceries"
# 3) "Clean room"
# 4) "Learn Redis"
```

### Remove items (LPOP = from start, RPOP = from end)
```redis
LPOP tasks    # removes and returns "Wake up early"
RPOP tasks    # removes and returns "Learn Redis"
LRANGE tasks 0 -1
# 1) "Buy groceries"
# 2) "Clean room"
```

### Get list length
```redis
LLEN tasks    # 2
```

### Get item by index (0-based)
```redis
LINDEX tasks 0    # "Buy groceries"
LINDEX tasks 1    # "Clean room"
```

## Real World Use Cases
- **Recent activity feed**: LPUSH new activity, LRANGE to show last 10
- **Message queue**: RPUSH to add job, LPOP to process job
- **Chat history**: Store last N messages
- **Undo history**: Push actions, pop to undo
