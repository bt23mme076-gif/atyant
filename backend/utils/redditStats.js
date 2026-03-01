import axios from 'axios';
import aiService from '../services/AIService.js';

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
    posts: posts.slice(0, 3).map(post => ({
      title: post.data?.title,
      selftext: post.data?.selftext?.substring(0, 300) || '',
      url: `https://reddit.com${post.data?.permalink}`,
      ups: post.data?.ups
    })),
    totalSolved: engagementScore > 50 ? engagementScore : Math.max(posts.length * 45, 120),
    totalThreads: posts.length
  };
};

// Main function
export const getRedditStats = async (questionText) => {
  try {
    const { posts, totalSolved, totalThreads } = await fetchRedditPosts(questionText);
    console.log(`✅ Reddit: ${totalThreads} posts fetched, totalSolved=${totalSolved}`);

    let summary = null;

    if (posts.length > 0) {
      const postsText = posts.map((p, i) =>
        `Post ${i+1}: ${p.title}\n${p.selftext}`
      ).join('\n\n');

      const prompt = `A student asked this question:

"${questionText}"

Here are Reddit discussions about it:

${postsText}

Summarize the practical advice students gave.
Write ONLY 3 short clear lines in simple English.
No introduction. Direct answer.`;

      const result = await aiService.chat('000000000000000000000000', prompt);

      if (result && result.success) {
        summary = result.response;
      } else {
        summary = null;
      }

      console.log('✅ Summary:', summary?.substring(0, 80) || 'NULL');
    }

    return { totalSolved, totalThreads, topPosts: posts, aiSummary: summary };

  } catch (err) {
    console.log('Reddit search failed:', err.message);
    return { totalSolved: 120, totalThreads: 0, topPosts: [], aiSummary: null };
  }
};