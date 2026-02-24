# Redis Hashes - Like an Object/Dictionary

## What is it?
One key holds multiple field-value pairs.
Like a JavaScript object: { name: "Dhruval", age: 25 }

```
key → { field1: value1, field2: value2, ... }
```

## Try these in redis-cli:

### Create a user profile
```redis
HSET user:1 name "Dhruval" age "25" city "Ahmedabad" role "developer"
```

### Get one field
```redis
HGET user:1 name      # "Dhruval"
HGET user:1 city      # "Ahmedabad"
```

### Get all fields and values
```redis
HGETALL user:1
# 1) "name"
# 2) "Dhruval"
# 3) "age"
# 4) "25"
# 5) "city"
# 6) "Ahmedabad"
# 7) "role"
# 8) "developer"
```

### Update a field
```redis
HSET user:1 age "26"
HGET user:1 age       # "26"
```

### Get multiple fields at once
```redis
HMGET user:1 name city
# 1) "Dhruval"
# 2) "Ahmedabad"
```

### Increment a number field
```redis
HINCRBY user:1 age 1
HGET user:1 age       # "27"
```

### Check if field exists
```redis
HEXISTS user:1 name     # 1 (yes)
HEXISTS user:1 email    # 0 (no)
```

### Delete a field
```redis
HDEL user:1 role
HGETALL user:1          # role is gone
```

### Get all field names or all values
```redis
HKEYS user:1    # lists all field names
HVALS user:1    # lists all values
```

## Real World Use Cases
- **User profiles**: Store user data as hash fields
- **Shopping cart**: `cart:user123 → { item1: 2, item2: 1 }` (item: quantity)
- **Configuration**: App settings as hash fields
- **Object caching**: Cache database row as a hash
```

## Why Hash instead of multiple Strings?

```
# BAD - 3 separate keys
SET user:1:name "Dhruval"
SET user:1:age "25"
SET user:1:city "Ahmedabad"

# GOOD - 1 key, 3 fields (uses less memory, easier to manage)
HSET user:1 name "Dhruval" age "25" city "Ahmedabad"
```
