# Redis Sets - Unique Collection (No Duplicates)

## What is it?
A collection where every item is unique. No order guaranteed.
Like a JavaScript Set: new Set(["a", "b", "c"])

```
key → { value1, value2, value3 }  (all unique)
```

## Try these in redis-cli:

### Add members
```redis
SADD skills "javascript"
SADD skills "python"
SADD skills "redis"
SADD skills "javascript"    # ignored! already exists

SMEMBERS skills
# 1) "python"
# 2) "javascript"
# 3) "redis"
```

### Check membership
```redis
SISMEMBER skills "python"      # 1 (yes, it's there)
SISMEMBER skills "java"        # 0 (no)
```

### Count members
```redis
SCARD skills    # 3
```

### Remove a member
```redis
SREM skills "python"
SMEMBERS skills
# 1) "javascript"
# 2) "redis"
```

### Get a random member
```redis
SADD fruits "apple" "banana" "mango" "grape" "orange"
SRANDMEMBER fruits       # random one
SRANDMEMBER fruits 3     # random three
```

### Set Operations (the powerful part!)
```redis
SADD user:1:friends "Alice" "Bob" "Charlie"
SADD user:2:friends "Bob" "David" "Charlie"

# INTERSECTION - mutual friends
SINTER user:1:friends user:2:friends
# 1) "Bob"
# 2) "Charlie"

# UNION - all friends combined
SUNION user:1:friends user:2:friends
# 1) "Alice"
# 2) "Bob"
# 3) "Charlie"
# 4) "David"

# DIFFERENCE - friends of user:1 but NOT user:2
SDIFF user:1:friends user:2:friends
# 1) "Alice"
```

## Real World Use Cases
- **Tags**: Each post has a set of tags (no duplicate tags)
- **Unique visitors**: `SADD page:home:visitors "user123"` (auto-deduplicates)
- **Mutual friends**: SINTER between two users' friend sets
- **Online users**: SADD when login, SREM when logout
- **Voting**: Each user can only vote once (set = unique)
