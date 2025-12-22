# Atyant Engine - Visual Flow Diagrams

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ATYANT ENGINE SYSTEM                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   STUDENT    │
│   (User)     │
└──────┬───────┘
       │
       │ 1. Visits atyant.in/ask
       │ 2. Types question: "How to get PM internship?"
       │
       ▼
┌─────────────────────────────────────────┐
│   ATYANT ENGINE (Backend)               │
│                                         │
│  ┌──────────────────────────┐          │
│  │ 1. Extract Keywords      │          │
│  │    - "PM"                │          │
│  │    - "internship"        │          │
│  │    - "product"           │          │
│  └──────────┬───────────────┘          │
│             │                           │
│             ▼                           │
│  ┌──────────────────────────┐          │
│  │ 2. Find Matching Mentors │          │
│  │    Search DB for:        │          │
│  │    - expertise contains  │          │
│  │      keywords            │          │
│  │    - bio relevance       │          │
│  │    - ratings             │          │
│  └──────────┬───────────────┘          │
│             │                           │
│             ▼                           │
│  ┌──────────────────────────┐          │
│  │ 3. Score Each Mentor     │          │
│  │    Mentor A: 23 points   │ ← Best  │
│  │    Mentor B: 15 points   │          │
│  │    Mentor C: 8 points    │          │
│  └──────────┬───────────────┘          │
│             │                           │
│             ▼                           │
│  ┌──────────────────────────┐          │
│  │ 4. Assign Mentor A       │          │
│  │    (INTERNAL ONLY)       │          │
│  │    ✗ User doesn't see    │          │
│  └──────────┬───────────────┘          │
└─────────────┼───────────────────────────┘
              │
              │ 5. Create Question record
              │    status: "mentor_assigned"
              │
              ▼
      ┌───────────────┐
      │  USER VIEW    │
      │  /engine/123  │
      │               │
      │  Your Question│
      │  "How to get │
      │   PM intern?" │
      │               │
      │  Status:      │
      │  [●●○○]       │
      │  Processing.. │
      └───────────────┘
              │
              │ 6. Mentor receives notification
              │
              ▼
┌──────────────────────────────────┐
│   MENTOR (Internal Interface)    │
│   /mentor-dashboard              │
│                                  │
│  Pending Question:               │
│  "How to get PM internship?"     │
│                                  │
│  ┌────────────────────────────┐ │
│  │ EXPERIENCE FORM            │ │
│  │                            │ │
│  │ Situation:                 │ │
│  │ [I was in 3rd year...]     │ │
│  │                            │ │
│  │ First Attempt:             │ │
│  │ [Mass applied 100+...]     │ │
│  │                            │ │
│  │ What Failed:               │ │
│  │ [Generic resume, 0...]     │ │
│  │                            │ │
│  │ What Worked:               │ │
│  │ [Built side project...]    │ │
│  │                            │ │
│  │ Step-by-Step:              │ │
│  │ [1. Pick problem...]       │ │
│  │                            │ │
│  │ Timeline:                  │ │
│  │ [5 weeks total...]         │ │
│  │                            │ │
│  │ Do Differently:            │ │
│  │ [Start smaller...]         │ │
│  │                            │ │
│  │ [Submit Experience]        │ │
│  └────────────────────────────┘ │
└──────────────┬───────────────────┘
               │
               │ 7. Submit raw experience
               │
               ▼
┌──────────────────────────────────────┐
│   AI TRANSFORMATION                  │
│   (Gemini API)                       │
│                                      │
│  Input (Mentor's voice):             │
│  "I mass applied to 100 companies    │
│   with generic resume..."            │
│                                      │
│  Output (Atyant's voice):            │
│  "Here's what works based on real    │
│   experience: Mass applications fail │
│   because..."                        │
│                                      │
│  ✓ Removes "I", "my", "me"          │
│  ✓ Adds structure                   │
│  ✓ Makes it actionable              │
│  ✓ Maintains mistakes & steps       │
└──────────────┬───────────────────────┘
               │
               │ 8. Generate Answer Card
               │
               ▼
┌──────────────────────────────────────────┐
│   ANSWER CARD (Delivered to User)       │
│   /engine/123                            │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ ✨ Your Answer is Ready            │ │
│  │                                    │ │
│  │ ✓ Built from real experience      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Main Answer:                            │
│  ┌────────────────────────────────────┐ │
│  │ Here's what works: Mass applying   │ │
│  │ fails because recruiters ignore    │ │
│  │ generic resumes. The proven path:  │ │
│  │ build a side project that solves   │ │
│  │ a real problem, document your      │ │
│  │ product decisions...               │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ❌ Common Mistakes:                    │
│  ┌────────────────────────────────────┐ │
│  │ • Generic resumes get 0 responses  │ │
│  │ • Mass applying wastes time        │ │
│  │ • Not networking with PMs          │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ✅ Actionable Steps:                   │
│  ┌────────────────────────────────────┐ │
│  │ 1. Pick a problem you face         │ │
│  │    Spend 1 day finding 5 problems  │ │
│  │                                    │ │
│  │ 2. Build smallest solution         │ │
│  │    1-2 weeks max, one core feature │ │
│  │                                    │ │
│  │ 3. Document thinking               │ │
│  │    Write blog about decisions      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ⏱️ Timeline:                           │
│  5 weeks total - realistic for results  │
│                                          │
│  💡 Why This Works:                     │
│  Based on direct experience switching   │
│  to PM with zero background             │
│                                          │
│  — Atyant Expert Mentor                 │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Was this helpful?                  │ │
│  │ [👍 Yes] [👎 No]                  │ │
│  │ ⭐⭐⭐⭐⭐                         │ │
│  │ [Submit Feedback]                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Follow-up Question (2 left)        │ │
│  │ [Type your follow-up...]           │ │
│  │ [Submit Follow-up]                 │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Question   │────▶│   Mentor     │────▶│   Answer    │
│  Collection │     │  Experience  │     │    Card     │
└─────────────┘     │  Collection  │     │  Collection │
                    └──────────────┘     └─────────────┘

Question Document:
{
  userId: "user123",
  questionText: "How to...",
  keywords: ["pm", "intern"],
  selectedMentorId: "mentor456", ← HIDDEN
  status: "delivered",
  answerCardId: "card789"
}

MentorExperience Document:
{
  questionId: "q123",
  mentorId: "mentor456",
  rawExperience: {
    situation: "...",
    failures: "...",
    whatWorked: "..."
  },
  status: "submitted"
}

AnswerCard Document:
{
  questionId: "q123",
  mentorId: "mentor456", ← HIDDEN
  answerContent: {
    mainAnswer: "...",
    keyMistakes: [...],
    actionableSteps: [...]
  },
  signature: "— Atyant Expert Mentor"
}
```

---

## Status Progression

```
Question Lifecycle:

pending
   ↓
mentor_assigned (User sees "Processing")
   ↓
awaiting_experience (Mentor notified)
   ↓
experience_submitted (Mentor filled form)
   ↓
answer_generated (AI transformed)
   ↓
delivered (User sees Answer Card)

UI Progress Bar:
[●●○○] → [●●●○] → [●●●●]
Step 1    Step 3    Step 4
```

---

## Mentor Selection Algorithm

```
┌────────────────────────────────┐
│   MENTOR SCORING SYSTEM        │
└────────────────────────────────┘

Input: Question keywords ["react", "web", "project"]

For each mentor:
  score = 0
  
  1. Check Expertise Match
     if mentor.expertise contains "react"
       score += 5
     if mentor.expertise contains "web development"
       score += 5
  
  2. Check Bio Relevance
     if mentor.bio contains "react"
       score += 2
     if mentor.bio contains "web"
       score += 2
  
  3. Rating Boost
     score += (mentor.ratings.average / 5) * 3
     
  4. Experience History (future)
     if mentor solved similar question before
       score += 10

Sort mentors by score DESC
Select mentor with highest score

Example Results:
┌─────────┬───────────────┬───────┐
│ Mentor  │ Match Reason  │ Score │
├─────────┼───────────────┼───────┤
│ Alice   │ React expert  │  23   │ ← SELECTED
│ Bob     │ Web dev       │  15   │
│ Carol   │ General tech  │   8   │
└─────────┴───────────────┴───────┘
```

---

## Follow-up Flow

```
┌──────────────────────────────────────┐
│  ORIGINAL QUESTION                   │
│  "How to get PM internship?"         │
│  Answer Card delivered ✓             │
└──────────────┬───────────────────────┘
               │
               │ User asks follow-up
               │
               ▼
┌──────────────────────────────────────┐
│  FOLLOW-UP #1                        │
│  "What if I don't have time          │
│   to build a side project?"          │
└──────────────┬───────────────────────┘
               │
               │ → Creates NEW Question
               │ → Routes through Engine
               │ → SAME mentor selected
               │ → NEW Answer Card
               │
               ▼
┌──────────────────────────────────────┐
│  FOLLOW-UP ANSWER CARD               │
│  (Separate Answer Card)              │
│  Follow-up count: 1/2 used           │
└──────────────┬───────────────────────┘
               │
               │ User asks another
               │
               ▼
┌──────────────────────────────────────┐
│  FOLLOW-UP #2                        │
│  "How long should the project be?"   │
│  Follow-up count: 2/2 used           │
└──────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  LIMIT REACHED                       │
│  "Maximum 2 follow-ups allowed"      │
│  → Unlock 1-on-1 for more questions  │
│     (Future paid feature)            │
└──────────────────────────────────────┘
```

---

## Comparison: Old vs New

```
═══════════════════════════════════════════════════════════════

OLD FLOW (Before Atyant Engine)

User: "How to get PM internship?"
        ↓
System shows 5 mentor cards:
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 👤 Alice    │ │ 👤 Bob      │ │ 👤 Carol    │
│ PM Expert   │ │ Product     │ │ Tech Lead   │
│ ⭐⭐⭐⭐    │ │ ⭐⭐⭐      │ │ ⭐⭐⭐⭐⭐  │
│ [Chat Now]  │ │ [Chat Now]  │ │ [Chat Now]  │
└─────────────┘ └─────────────┘ └─────────────┘

User picks Alice → Direct chat starts
Alice: "Hi! So you want PM internship?"
User: "Yes, how do I start?"
Alice: "Build projects, network, apply"
User: "Okay thanks"
← Generic advice, no structure, inconsistent quality

═══════════════════════════════════════════════════════════════

NEW FLOW (With Atyant Engine)

User: "How to get PM internship?"
        ↓
System: "Atyant Engine is processing..."
        ↓
Engine: Finds Alice (user doesn't know)
        ↓
Alice receives form:
  When I was in this situation: [detailed]
  What I tried first: [specific]
  What failed: [mistakes]
  What worked: [solution]
  Step-by-step: [actionable]
  Timeline: [realistic]
  Do differently: [improvements]
        ↓
AI transforms → Answer Card:

┌─────────────────────────────────────┐
│ ✨ Your Answer is Ready             │
│ ✓ Built from real experience        │
│                                     │
│ Here's what works based on someone  │
│ who successfully landed a PM intern │
│ with zero experience:               │
│                                     │
│ ❌ Common Mistakes:                 │
│ • Mass applying (0% success rate)   │
│ • Generic resume (ignored)          │
│                                     │
│ ✅ Actionable Steps:                │
│ 1. Build one project (2 weeks)      │
│    - Pick problem you face          │
│    - Make smallest solution         │
│ 2. Document decisions (1 week)      │
│    - Write blog post                │
│ 3. Network with PMs (1 week)        │
│    - 10 cold messages               │
│                                     │
│ ⏱️ Timeline: 5 weeks total          │
│                                     │
│ — Atyant Expert Mentor              │
└─────────────────────────────────────┘

← Structured, actionable, proven, consistent

═══════════════════════════════════════════════════════════════
```

---

## Security & Privacy

```
┌────────────────────────────────────────┐
│   WHAT USER SEES                       │
├────────────────────────────────────────┤
│ ✓ Their question                       │
│ ✓ Processing status                    │
│ ✓ Answer Card content                  │
│ ✓ "Atyant Expert Mentor" signature     │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   WHAT USER NEVER SEES                 │
├────────────────────────────────────────┤
│ ✗ Mentor name                          │
│ ✗ Mentor profile                       │
│ ✗ Mentor ID                            │
│ ✗ How mentor was selected              │
│ ✗ Other candidate mentors              │
│ ✗ Raw mentor experience input          │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   WHAT MENTOR SEES                     │
├────────────────────────────────────────┤
│ ✓ Questions assigned to them           │
│ ✓ Question keywords                    │
│ ✓ Experience submission form           │
│ ✗ User identity (optional for privacy) │
└────────────────────────────────────────┘
```

---

**For more details, see:**
- `ATYANT_ENGINE_IMPLEMENTATION.md` - Technical implementation
- `MENTOR_GUIDE.md` - How to write good experiences
- `DEPLOYMENT_GUIDE.md` - Testing & deployment
- `README_ATYANT_ENGINE.md` - Executive summary
