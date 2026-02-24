# Redis Sorted Sets - Unique Items with Scores

## What is it?
Like a Set (unique items) but each item has a SCORE (number).
Items are automatically sorted by score. Perfect for leaderboards!

```
key → { value1: score1, value2: score2, ... }  (sorted by score)
```

## Try these in redis-cli:

### Create a game leaderboard
```redis
ZADD leaderboard 100 "Alice"
ZADD leaderboard 250 "Bob"
ZADD leaderboard 180 "Charlie"
ZADD leaderboard 300 "David"
ZADD leaderboard 150 "Eve"
```

### Get all members (lowest to highest score)
```redis
ZRANGE leaderboard 0 -1 WITHSCORES
# 1) "Alice"    - 100
# 2) "Eve"      - 150
# 3) "Charlie"  - 180
# 4) "Bob"      - 250
# 5) "David"    - 300
```

### Get all members (highest to lowest - typical leaderboard)
```redis
ZREVRANGE leaderboard 0 -1 WITHSCORES
# 1) "David"    - 300
# 2) "Bob"      - 250
# 3) "Charlie"  - 180
# 4) "Eve"      - 150
# 5) "Alice"    - 100
```

### Get top 3 players
```redis
ZREVRANGE leaderboard 0 2 WITHSCORES
# 1) "David"    - 300
# 2) "Bob"      - 250
# 3) "Charlie"  - 180
```

### Get someone's rank (0-based, lowest score = rank 0)
```redis
ZREVRANK leaderboard "Bob"    # 1 (second place, 0-based)
ZSCORE leaderboard "Bob"      # "250"
```

### Update score (add points)
```redis
ZINCRBY leaderboard 200 "Alice"    # Alice: 100 + 200 = 300
ZREVRANGE leaderboard 0 -1 WITHSCORES
# Alice is now tied with David at 300!
```

### Get members within a score range
```redis
ZRANGEBYSCORE leaderboard 150 250 WITHSCORES
# Shows members with scores between 150 and 250
```

### Count members in score range
```redis
ZCOUNT leaderboard 100 200    # how many have scores 100-200?
```

### Remove a member
```redis
ZREM leaderboard "Eve"
```

## Real World Use Cases
- **Game leaderboard**: Score = points, member = player name
- **Priority queue**: Score = priority, member = task
- **Time-based feed**: Score = timestamp, member = post ID
- **Rate limiting**: Score = request time, count members in last minute
- **Trending topics**: Score = mention count, member = hashtag
