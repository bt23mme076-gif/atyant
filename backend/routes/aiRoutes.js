import express from 'express';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

router.post('/chat', protect, async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'messages required' });
    }

    const payload = {
      model: GROQ_MODEL,
      messages: systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages,
      temperature: 0.72,
      max_tokens: 280,
    };

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error('Groq error:', err);
      return res.status(502).json({ success: false, error: 'Groq request failed' });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content || null;
    res.json({ success: true, reply });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ success: false, error: 'AI chat failed' });
  }
});

export default router;
