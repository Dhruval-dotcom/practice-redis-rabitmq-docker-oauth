# FAANG / Big Tech Interview Roadmap

A practical guide to prepare for Meta, Google, Amazon, Apple, Netflix, Microsoft, and similar top companies.

---

## What Big Tech Interviews Test

They don't test how many frameworks you know. They test how you THINK.

```
┌──────────────────────────────────────────────────────────────┐
│                    Big Tech Interview                         │
├──────────────┬───────────────┬────────────┬─────────────────┤
│  Coding      │ System Design │ Behavioral │ Culture Fit     │
│  (DSA)       │               │            │                 │
│  35-40%      │  25-30%       │  20-25%    │  10-15%         │
├──────────────┼───────────────┼────────────┼─────────────────┤
│ Arrays       │ Scale         │ Leadership │ Why this        │
│ Trees        │ Trade-offs    │ Conflict   │ company?        │
│ Graphs       │ Architecture  │ Failures   │ Values          │
│ DP           │ Databases     │ Teamwork   │ Growth          │
└──────────────┴───────────────┴────────────┴─────────────────┘
```

---

## Part 1: Data Structures & Algorithms (DSA)

This is the gate. You must pass coding rounds to get to system design.

**The hard truth**: You need to grind LeetCode. There's no shortcut. But there IS a smart way to do it.

---

### What to Learn (In This Order)

#### Phase 1: Foundations (Week 1-3)

You must be able to write these in your sleep. They appear in 70% of interviews.

**1. Arrays & Strings**
- Two pointers technique
- Sliding window
- Prefix sum
- Kadane's algorithm (max subarray)
- Binary search (on sorted arrays)
- String manipulation

**Key problems**:
- Two Sum
- Best Time to Buy and Sell Stock
- Maximum Subarray
- Container With Most Water
- Longest Substring Without Repeating Characters
- Valid Anagram
- Group Anagrams

**2. Hash Maps & Sets**
- Frequency counting
- Two Sum pattern (complement lookup)
- Grouping (anagrams, categories)
- Detecting duplicates

**Key problems**:
- Two Sum (hash map approach)
- Valid Sudoku
- Top K Frequent Elements
- Longest Consecutive Sequence

**3. Sorting & Searching**
- Know: Merge Sort, Quick Sort (how they work, time complexity)
- Binary Search variations (find first/last occurrence, search in rotated array)
- Sorting custom comparators

**Key problems**:
- Search in Rotated Sorted Array
- Find Minimum in Rotated Sorted Array
- Merge Intervals
- Meeting Rooms

---

#### Phase 2: Core Data Structures (Week 4-7)

**4. Linked Lists**
- Reverse a linked list
- Fast and slow pointers (cycle detection)
- Merge two sorted lists
- Remove nth node from end

**Key problems**:
- Reverse Linked List
- Merge Two Sorted Lists
- Linked List Cycle
- Remove Nth Node From End
- Reorder List

**5. Stacks & Queues**
- Monotonic stack
- Valid parentheses pattern
- Min stack
- Queue using stacks

**Key problems**:
- Valid Parentheses
- Min Stack
- Daily Temperatures
- Evaluate Reverse Polish Notation
- Largest Rectangle in Histogram

**6. Trees (Very Important!)**
- Binary tree traversals (inorder, preorder, postorder, level order)
- Binary Search Tree (BST) operations
- DFS and BFS on trees
- Lowest Common Ancestor
- Tree serialization

**Key problems**:
- Maximum Depth of Binary Tree
- Invert Binary Tree
- Same Tree
- Binary Tree Level Order Traversal
- Validate Binary Search Tree
- Lowest Common Ancestor
- Binary Tree Right Side View
- Serialize and Deserialize Binary Tree

**7. Heaps (Priority Queues)**
- Min heap, max heap
- Top K elements pattern
- Merge K sorted lists
- Median from data stream

**Key problems**:
- Kth Largest Element
- Top K Frequent Elements
- Merge K Sorted Lists
- Find Median from Data Stream

---

#### Phase 3: Advanced Patterns (Week 8-12)

**8. Graphs**
- BFS (shortest path in unweighted graph)
- DFS (explore all paths, detect cycles)
- Topological sort (course schedule, build order)
- Union-Find (connected components)
- Dijkstra's algorithm (shortest path in weighted graph)

**Key problems**:
- Number of Islands
- Clone Graph
- Course Schedule (I and II)
- Pacific Atlantic Water Flow
- Word Ladder
- Network Delay Time

**9. Dynamic Programming (DP)**
- This is the hardest topic. Don't panic if it takes time.
- Start with 1D DP, then 2D DP
- Common patterns: fibonacci-style, knapsack, longest common subsequence

**Key problems** (in order of difficulty):
- Climbing Stairs (easiest DP)
- House Robber
- Coin Change
- Longest Increasing Subsequence
- Word Break
- Unique Paths
- Longest Common Subsequence
- Edit Distance
- 0/1 Knapsack

**10. Backtracking**
- Generate all permutations/combinations
- Subset problems
- N-Queens, Sudoku solver

**Key problems**:
- Subsets
- Permutations
- Combination Sum
- Word Search
- Palindrome Partitioning

**11. Tries**
- Prefix trees for string problems
- Autocomplete, spell checker

**Key problems**:
- Implement Trie
- Word Search II
- Design Add and Search Words

---

### How to Practice LeetCode Effectively

**The wrong way**: Random problems. Solve one, move to unrelated next one. No pattern recognition.

**The right way**:

**Step 1: Learn the pattern first**
- Don't jump to problems. Watch a 10-minute explanation of the pattern (sliding window, two pointers, BFS, etc.)
- Understand WHEN to use it

**Step 2: Solve 3-5 problems of the SAME pattern**
- Your brain starts recognizing: "Oh, this is a sliding window problem"
- This pattern recognition is what interviewers look for

**Step 3: For each problem, follow this**
```
1. Read the problem (5 min)
2. Think about approach WITHOUT coding (10 min)
   - What data structure fits?
   - What pattern is this?
   - What's the time complexity?
3. Write pseudocode on paper (5 min)
4. Code it (15-20 min)
5. Test with edge cases (5 min)
6. If stuck for 30 min → read the solution, UNDERSTAND it, then code it yourself
7. Come back to this problem in 3 days and solve it again from scratch
```

**Step 4: Time yourself**
- In real interviews you get 30-45 minutes per problem
- Practice at that pace
- If you can't solve it in 45 min, study the solution and move on

---

### The LeetCode Study Plan

| Week | Focus | Problems Per Day | Total |
|------|-------|-----------------|-------|
| 1-2 | Arrays, Strings, Hash Maps | 3 easy | 42 |
| 3-4 | Two Pointers, Sliding Window, Binary Search | 2-3 easy/medium | 35 |
| 5-6 | Linked Lists, Stacks, Trees | 2-3 medium | 35 |
| 7-8 | Graphs (BFS/DFS), Heaps | 2 medium | 28 |
| 9-10 | Dynamic Programming | 2 medium | 28 |
| 11-12 | Backtracking, Tries, Mixed practice | 2 medium/hard | 28 |
| 13-16 | Mock interviews, Company-tagged problems | 2 per day | 56 |

**Total**: ~250 problems over 4 months. This is enough for most companies.

---

### Must-Do Problem Lists

If you don't have time for 250 problems, do these:

- **Blind 75** (75 problems) → The absolute minimum. Covers all patterns.
- **NeetCode 150** (150 problems) → Expanded version with better coverage.
- **Grind 75** (75 problems, time-sorted) → Optimized for limited study time.

**Resource**: neetcode.io has all of these organized by pattern with video explanations.

---

## Part 2: System Design

For mid-level and senior roles. Some companies skip this for junior roles.

---

### System Design Interview Format

```
45 minutes:
├── 5 min  → Understand requirements (ASK questions!)
├── 10 min → High-level design (draw boxes and arrows)
├── 20 min → Deep dive into components
└── 10 min → Discuss trade-offs, scaling, bottlenecks
```

**The biggest mistake**: Jumping to the solution without asking questions.
Always start with: "Let me clarify the requirements."

---

### System Design Building Blocks

Know these cold. Every design uses a combination of them.

| Building Block | What It Does | When to Use |
|---------------|-------------|-------------|
| **Load Balancer** | Distributes traffic across servers | Always (for any scaled system) |
| **CDN** | Serves static content from nearby servers | Images, videos, CSS, JS files |
| **Web Server** | Handles HTTP requests | Always |
| **Application Server** | Runs business logic | Always |
| **Database** | Stores persistent data | Always |
| **Cache** | Stores frequently accessed data in memory | Reduce database load |
| **Message Queue** | Async communication between services | Decouple services, background jobs |
| **Blob Storage** | Store large files (images, videos) | User uploads, media |
| **Search Service** | Full-text search | Search features (Elasticsearch) |
| **Notification Service** | Push, email, SMS | Any notification feature |
| **Rate Limiter** | Limit requests per user | API protection |

---

### How to Approach Any System Design

**Use this framework every time**:

```
Step 1: REQUIREMENTS
   - Functional: What should the system DO?
   - Non-functional: Scale? Latency? Availability? Consistency?
   - Estimate: How many users? How much data? Reads vs writes?

Step 2: HIGH-LEVEL DESIGN
   - Draw the main components (client, server, database, cache)
   - Show how data flows between them
   - Keep it simple at first

Step 3: DEEP DIVE
   - Pick the most interesting/complex component
   - Discuss database schema
   - Discuss API design
   - Discuss caching strategy
   - Discuss how it scales

Step 4: TRADE-OFFS
   - What are the bottlenecks?
   - What would break at 10x scale?
   - What did you sacrifice and why?
```

---

### Top 15 System Design Problems to Prepare

Practice these. They cover most patterns you'll encounter.

| # | Problem | Key Concepts |
|---|---------|-------------|
| 1 | **URL Shortener** (bit.ly) | Hashing, database design, read-heavy, caching |
| 2 | **Twitter/X Feed** | Fan-out, timeline generation, caching, ranking |
| 3 | **Instagram** | Image storage, CDN, feed generation, stories |
| 4 | **WhatsApp/Chat** | WebSockets, message queue, presence, group chat |
| 5 | **YouTube** | Video storage, transcoding, CDN, recommendations |
| 6 | **Google Search** | Web crawler, indexing, ranking, autocomplete |
| 7 | **Uber/Ride Sharing** | Location service, matching, real-time tracking |
| 8 | **Dropbox/Google Drive** | File sync, chunking, deduplication, conflict resolution |
| 9 | **Notification System** | Multi-channel (push, email, SMS), priority, templates |
| 10 | **Rate Limiter** | Token bucket, sliding window, distributed limiting |
| 11 | **Web Crawler** | BFS crawling, politeness, deduplication, distributed |
| 12 | **Ticket Booking** (BookMyShow) | Seat locking, concurrent access, payment |
| 13 | **Amazon E-commerce** | Cart, inventory, orders, payments, search |
| 14 | **Netflix** | Video streaming, CDN, recommendations, A/B testing |
| 15 | **Distributed Cache** | Consistent hashing, eviction, replication |

---

### System Design Resources

| Resource | Type | Best For |
|----------|------|----------|
| **System Design Interview** (Alex Xu, Vol 1 & 2) | Book | Best structured overview, start here |
| **NeetCode System Design** | YouTube | Visual explanations of common problems |
| **ByteByteGo** (Alex Xu) | YouTube/Newsletter | Weekly system design concepts |
| **Designing Data-Intensive Applications** | Book | Deep understanding (read after basics) |
| **Gaurav Sen** | YouTube | Animated explanations |
| **Exponent** | YouTube | Mock interview recordings |

---

## Part 3: Behavioral Interviews

This is where most developers underestimate. Big tech weighs behavioral heavily.

---

### What They're Actually Asking

When they ask "Tell me about a time when..." they're evaluating:

| They Ask | They're Checking |
|----------|-----------------|
| Tell me about a challenging project | Can you handle complexity? |
| Tell me about a disagreement with a teammate | Can you handle conflict professionally? |
| Tell me about a failure | Are you self-aware? Do you learn from mistakes? |
| Tell me about a time you led something | Can you take ownership? |
| Why this company? | Have you done your homework? Are you genuinely interested? |

---

### The STAR Method (Use This for Every Answer)

```
S - Situation  → Set the scene (1-2 sentences)
T - Task       → What was your responsibility? (1 sentence)
A - Action     → What exactly did YOU do? (This is the main part - 3-5 sentences)
R - Result     → What was the outcome? Use numbers if possible. (1-2 sentences)
```

**Example**:

"Tell me about a time you improved performance."

```
Situation: Our dashboard was taking 8 seconds to load for users with large datasets.
           Users were complaining and some were leaving.

Task:      I was responsible for investigating and fixing the performance issue.

Action:    I profiled the API and found we were making 15 separate database queries
           per page load. I implemented Redis caching for the most expensive queries,
           combined the remaining queries into 3 batch queries, and added pagination
           so we weren't loading all data at once.

Result:    Load time dropped from 8 seconds to 1.2 seconds. User complaints dropped
           by 90% and we saw a 15% increase in daily active users that month.
```

**Notice**: Specific numbers. Clear actions. Real impact.

---

### Prepare 8-10 Stories

Have these stories ready. You can reuse them for different questions.

| Story Topic | Example Questions It Answers |
|------------|----------------------------|
| A technically challenging project | "Tell me about a challenge", "Most complex thing you built" |
| A time you disagreed with someone | "Conflict with teammate", "When you pushed back" |
| A time you failed / made a mistake | "Tell me about a failure", "What would you do differently" |
| A time you led a project or initiative | "Leadership example", "When you went above and beyond" |
| A time you helped someone grow | "Mentoring", "Helping a teammate" |
| A time you dealt with ambiguity | "Unclear requirements", "Had to make decisions with limited info" |
| A time you delivered under tight deadline | "Working under pressure", "Prioritization" |
| A time you improved a process | "Made something better", "Increased efficiency" |

**Write these down.** Practice saying them out loud. Not memorized word-for-word, but the key points should flow naturally.

---

### Company-Specific Values

Each company has core values they screen for. Speak their language.

**Amazon (Leadership Principles)**:
- Customer Obsession, Ownership, Bias for Action, Dive Deep
- Every behavioral question maps to a leadership principle
- Study all 16 principles and have a story for each
- They literally grade you against these

**Meta**:
- Move Fast, Be Bold, Focus on Impact, Be Open, Build Social Value
- They value speed of execution and impact
- Show you can ship fast and iterate

**Google**:
- Googleyness: intellectual humility, collaborative, comfortable with ambiguity
- They want people who ask "why" and think beyond the immediate problem
- Show curiosity and systematic thinking

**Apple**:
- Attention to detail, passion for products, design thinking
- They want people who care deeply about user experience

**Microsoft**:
- Growth mindset, customer-focused, diverse and inclusive
- Show you're always learning and helping others grow

---

## Part 4: Interview Timeline

### If You Have 3 Months

```
Month 1: DSA Focus
├── Week 1-2: Arrays, Strings, Hash Maps (3 problems/day)
├── Week 3:   Two Pointers, Sliding Window (2-3 problems/day)
└── Week 4:   Binary Search, Sorting (2-3 problems/day)

Month 2: DSA + System Design
├── Week 5-6: Trees, Graphs, Heaps (2 problems/day)
├── Week 7-8: Dynamic Programming (2 problems/day)
├── Start system design: 1 design per week
└── Start preparing behavioral stories

Month 3: Mock Interviews + Polish
├── Week 9-10:  Mixed practice + Company-tagged problems
├── Week 11-12: Mock interviews (with friends or online platforms)
├── Complete system design prep: 2 designs per week
└── Polish behavioral stories
```

### If You Have 6 Months

```
Month 1-2: DSA foundations (all patterns, 200 problems)
Month 3:   Advanced DSA (DP, Graphs, hard problems)
Month 4:   System Design (fundamentals + 8 designs)
Month 5:   System Design (7 more designs) + Behavioral prep
Month 6:   Mock interviews, company-specific prep, polish everything
```

---

## Part 5: The Application Strategy

### Where to Apply

Apply to 15-20 companies, not just FAANG. Include:

- **Dream companies** (3-5): Meta, Google, etc.
- **Strong companies** (5-7): Stripe, Uber, Airbnb, Spotify, Databricks, etc.
- **Realistic targets** (5-8): Growing startups, mid-size tech companies

**Why?** Interview practice. Your first interviews will be your worst. Don't waste them on dream companies.

**Order**: Apply to realistic targets first → strong companies → dream companies last.

---

### Resume Tips for Big Tech

- **One page.** Always. No exceptions.
- **Lead with impact, not responsibilities.**
  - Bad: "Responsible for frontend development"
  - Good: "Reduced page load time by 70% by implementing Redis caching, serving 50K daily users"
- **Use numbers everywhere.** "Improved performance by 60%", "Reduced errors by 40%", "Served 100K users"
- **List technologies, but don't overdo it.** Skills section with relevant tech only.
- **Projects matter.** If work experience is limited, strong projects can substitute.
- **No objectives, no hobbies, no photos.** Just experience, projects, education, skills.

---

### Mock Interviews

**This is the single most important thing you can do.**

Solving problems alone is NOT the same as solving them while someone watches.

- **Pramp** (free) → Peer mock interviews
- **Interviewing.io** → Anonymous mock interviews with real engineers
- **Practice with friends** → Take turns interviewing each other
- **Record yourself** → Talk through a problem and watch it back. You'll notice bad habits immediately.

**Do at least 5-10 mock interviews before your real ones.**

---

## Part 6: During the Interview

### Coding Interview Tips

1. **Clarify before coding.** Ask about input size, edge cases, expected output format.
2. **Talk through your approach** before writing code. "I'm thinking of using a hash map because..."
3. **Start with brute force.** Show you can solve it, then optimize.
4. **Write clean code.** Variable names matter even in interviews.
5. **Test your code** with examples before saying "I'm done."
6. **Discuss time and space complexity** without being asked.
7. **If stuck, say so.** "I'm thinking about the right data structure here" is better than silence.

### System Design Tips

1. **Never start designing immediately.** Spend 5 minutes on requirements.
2. **Start simple.** Single server → then scale.
3. **Drive the conversation.** Don't wait for the interviewer to lead.
4. **Use numbers.** "This table will have ~100M rows" → shows you think about scale.
5. **Discuss trade-offs proactively.** "We could use SQL or NoSQL here. I'd choose SQL because..."
6. **Draw clearly.** Boxes, arrows, labels. Make it easy to follow.

### Behavioral Tips

1. **Be specific.** Not "I'm a team player." Instead, tell a specific story.
2. **Own your actions.** Say "I did" not "we did" (even in team projects, focus on YOUR contribution).
3. **Show growth.** "I learned that..." or "Next time I would..."
4. **Be honest about failures.** They want self-awareness, not perfection.
5. **Ask good questions at the end.** Shows genuine interest.

---

## Part 7: Good Questions to Ask Your Interviewers

Always have 3-5 questions ready. These show maturity and genuine interest.

**About the team**:
- "What does a typical day look like on this team?"
- "How does the team handle tech debt?"
- "What's the team's biggest challenge right now?"

**About growth**:
- "How does the company support professional development?"
- "What does the promotion process look like for engineers?"
- "Can you describe the mentorship culture?"

**About the product**:
- "What's the most impactful project the team shipped recently?"
- "How do engineering and product teams collaborate?"
- "What's the technical roadmap for the next 6 months?"

**Never ask about salary in the interview.** That's for the recruiter/HR after you get the offer.

---

## Summary

```
To crack Big Tech:

1. DSA (LeetCode)       → Solve 150-250 problems by pattern
2. System Design         → Learn building blocks, practice 15 designs
3. Behavioral            → Prepare 8-10 STAR stories, know company values
4. Mock Interviews       → Do 5-10 before real interviews
5. Apply Strategically   → 15-20 companies, easy ones first
6. Communicate Clearly   → Think out loud, explain trade-offs
```

The process takes 3-6 months of focused preparation.
It's hard. It's supposed to be hard. That's what makes the result worth it.

You already build real projects and learn fast. That foundation is strong.
Now add the interview skills on top, and you'll be ready.
