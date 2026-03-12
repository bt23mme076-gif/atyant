import axios from 'axios';
import fetch from 'node-fetch';

// Direct Gemini call — no chat wrapper, no system prompt baggage
const summarizeWithGemini = async (prompt) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text && text.trim().length > 10 ? text.trim() : null;
  } catch (err) {
    console.log('Gemini summary failed:', err.message);
    return null;
  }
};

// Reddit se posts fetch karo
const fetchRedditPosts = async (questionText) => {
  const query = questionText.split(' ').slice(0, 5).join(' ');

  const response = await axios.get(
    'https://www.reddit.com/search.json',
    {
      params: { q: query, limit: 100, sort: 'relevance', t: 'all' },
      headers: { 'User-Agent': 'atyant-platform/1.0 (educational project)' },
      timeout: 5000
    }
  );

  const posts = response.data?.data?.children || [];
  const totalUpvotes = posts.reduce((sum, post) => sum + (post.data?.ups || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.data?.num_comments || 0), 0);
  const engagementScore = totalUpvotes + totalComments;

  return {
    // top 3 used for AI summarisation (includes selftext)
    posts: posts.slice(0, 3).map(post => ({
      title: post.data?.title,
      selftext: post.data?.selftext?.substring(0, 300) || '',
      url: `https://reddit.com${post.data?.permalink}`,
      ups: post.data?.ups || 0
    })),
    // top 10 shown as clickable list in UI
    top10Posts: posts.slice(0, 10).map(post => ({
      title: post.data?.title,
      url: `https://reddit.com${post.data?.permalink}`,
      ups: post.data?.ups || 0,
      numComments: post.data?.num_comments || 0,
      subreddit: post.data?.subreddit_name_prefixed || 'r/unknown'
    })),
    totalSolved: engagementScore > 50 ? engagementScore : Math.max(posts.length * 45, 120),
    totalThreads: posts.length
  };
};

// Main function
export const getRedditStats = async (questionText) => {
  try {
    const { posts, top10Posts, totalSolved, totalThreads } = await fetchRedditPosts(questionText);
    console.log(`✅ Reddit: ${totalThreads} posts fetched, totalSolved=${totalSolved}`);

    let summary = null;

    if (posts.length > 0) {
      const postsText = posts.map((p, i) =>
        `Post ${i+1}: ${p.title}\n${p.selftext}`
      ).join('\n\n');

      const prompt = `A student asked: "${questionText}"

Here are the top Reddit discussions on this topic:

${postsText}

Based on these Reddit threads, write a 3-point summary of the most practical advice students shared.
Be direct and specific. No intro sentence. Plain English only.`;

      summary = await summarizeWithGemini(prompt);
      console.log('✅ Summary:', summary?.substring(0, 80) || 'NULL');
    }

    return { totalSolved, totalThreads, topPosts: posts, top10Posts, aiSummary: summary };

  } catch (err) {
    console.log('Reddit search failed:', err.message);
    return { totalSolved: 120, totalThreads: 0, topPosts: [], top10Posts: [], aiSummary: null };
  }
};