# 🚀 Vector Search Setup Guide

This guide will help you enable **instant answers** using MongoDB Atlas Vector Search.

## 📋 Prerequisites

- MongoDB Atlas cluster (M10 or higher for production)
- AnswerCards collection with embeddings

## 🔧 Step 1: Create Vector Search Index in MongoDB Atlas

1. **Go to MongoDB Atlas Console**
   - Navigate to your cluster
   - Click on the "Search" tab
   - Click "Create Search Index"

2. **Select "JSON Editor"**

3. **Paste this configuration:**

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 384,
        "similarity": "cosine"
      }
    }
  }
}
```

4. **Configure Index:**
   - **Index Name:** `vector_index` (MUST be exactly this name)
   - **Database:** `atyant` (or your database name)
   - **Collection:** `answercards`

5. **Click "Create Search Index"**

6. **Wait for index to build** (Status should change to "Active")

## 📊 Step 2: Add Embeddings to Existing AnswerCards

If you have existing AnswerCards without embeddings, run the migration script:

```bash
cd backend
node addEmbeddingsToAnswerCards.js
```

This will:
- ✅ Generate embeddings for all AnswerCards
- ✅ Process in batches to avoid rate limits
- ✅ Show progress and success/fail counts

Expected output:
```
📊 AnswerCard Statistics:
   Total: 15
   Without embeddings: 15
   With embeddings: 0

🔄 Processing 15 AnswerCards in batches of 10...
✅ Updated 67abc123... - 384 dimensions
...
🎉 Migration Complete!
   ✅ Successfully updated: 15
```

## ✅ Step 3: Verify Setup

### Test Vector Search

1. **Restart your backend server:**
```bash
cd backend
node server.js
```

2. **Ask a question through the UI**
   - The system will now try vector search first
   - Check backend logs for:

```
🔍 Step 1: Generating embedding for question...
✅ Embedding generated: 384 dimensions
🔍 Step 2: Searching for similar answers in vector database...
📊 Database Stats:
   Total AnswerCards: 15
   AnswerCards with embeddings: 15
⚡ INSTANT ANSWER FOUND!
   Mentor: rahulthedon
   Match Score: 94.2%
```

### Verify in Database

Run this query in MongoDB Compass or Atlas:

```javascript
db.answercards.countDocuments({ 
  embedding: { $exists: true, $ne: null } 
})
```

Should return the number of AnswerCards with embeddings.

## 🎯 How It Works

```
User asks: "How to prepare for Google internship?"
    ↓
1. Generate embedding (384-dimension vector)
    ↓
2. Search AnswerCards using cosine similarity
    ↓
3. If match > 88% → ⚡ INSTANT ANSWER
    ↓
4. If no match → Route to live mentor
```

## 🐛 Troubleshooting

### Error: "Vector index not found"
**Fix:** Make sure the index is created in Atlas with name `vector_index`

### No instant answers showing
**Check:**
1. AnswerCards have embeddings: `db.answercards.find({ embedding: { $exists: true } }).count()`
2. Vector index status is "Active" in Atlas
3. Backend logs show embedding generation: `✅ Embedding generated: 384 dimensions`

### Migration script fails
**Common reasons:**
- OpenAI API key missing or invalid
- Rate limit exceeded (add delays between batches)
- Content too short (< 20 characters)

## 📈 Performance

- **Vector search:** ~50-200ms
- **Embedding generation:** ~300-500ms
- **Total instant answer:** <1 second
- **Fallback to live routing:** 2-5 seconds

## 🔐 Security Notes

- Embeddings are stored but never shown to users
- Vector search uses `select: false` to avoid loading embeddings in normal queries
- Only similarity scores are exposed, not raw vectors

## 🚀 Next Steps

Once vector search is working:
1. Monitor match rates: How many questions get instant answers?
2. Adjust `SEMANTIC_FLOOR` (currently 85%) if needed
3. Encourage mentors to answer more questions → more training data
4. Consider fine-tuning for better similarity detection

---

**Need Help?** Check backend logs with `NODE_ENV=development node server.js`
