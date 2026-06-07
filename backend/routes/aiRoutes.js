import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { generateProblemStatement, isEngineReady } from '../services/ProblemStatementGenerator.js';

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

// Agent turn endpoint (no protect middleware)
router.post('/agent/turn', async (req, res) => {
  try {
    const { messages = [], profile = null } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    // Build profile block so AI never re-asks known info
    const profileLines = [];
    if (profile) {
      const edu = profile.education?.[0] || {};
      if (profile.name)          profileLines.push(`- Name: ${profile.name}`);
      if (edu.institutionName)   profileLines.push(`- College: ${edu.institutionName}`);
      if (edu.field)             profileLines.push(`- Branch: ${edu.field}`);
      if (edu.cgpa)              profileLines.push(`- CGPA: ${edu.cgpa}`);
      if (edu.year)              profileLines.push(`- Year: ${edu.year}`);
      if (profile.bio)           profileLines.push(`- Bio: ${profile.bio.substring(0, 150)}`);
      if (profile.skills?.length)    profileLines.push(`- Skills: ${profile.skills.slice(0, 5).join(', ')}`);
      if (profile.interests?.length) profileLines.push(`- Interests: ${profile.interests.slice(0, 5).join(', ')}`);
    }
    const profileBlock = profileLines.length > 0
      ? `STUDENT PROFILE (already known — do NOT re-ask):\n${profileLines.join('\n')}`
      : `STUDENT PROFILE: not filled yet.`;

    const systemPrompt = `You are Atyant AI — a warm, sharp career advisor for Indian engineering students. You feel like the cool senior in their college who actually cracked things: IIM, Google, IIT research internship, whatever. Friendly and encouraging, but never fluffy. You cut to what matters.

${profileBlock}

YOUR JOB: Have a real conversation. Read the full thread. Map the student's situation across 5 layers before handing off to the engine.

THE 5 LAYERS YOU MUST MAP:
1. Identity   — college, branch, year, cgpa
2. Target     — what they actually want (specific company, IIM, internship type, switch path)
3. Gap        — what's blocking them (no coding, no projects, wrong branch, weak resume, no network)
4. Timeline   — how long they have (this month, 5 months, next semester, long-term)
5. Constraint — hard limits (no paid courses, no CS peers, time-bound, first-gen, Tier-3 pedigree)

CORE RULES:
1. Read emotion first. If they sound lost or anxious, acknowledge it before solving.
2. Ask ONE question at a time, targeting the most important MISSING layer.
3. NEVER ask for info you already have — re-read the thread and profile before asking anything.
4. Talk like a human. Use contractions. Be specific. Reference their college/branch by name.
5. For greetings, just ask warmly what's on their mind.
6. For vague messages, ask the single most useful clarifying question.

ENGINE TRIGGER — set should_trigger_engine to true ONLY when ALL are true:
- Identity known (college + branch, from chat or profile)
- Target is concrete (a real goal a senior could act on)
- At least 3 of the 5 layers are filled (identity + target + one of gap/timeline/constraint)

OUTPUT: Respond ONLY with valid JSON, no markdown, no extra text:
{
  "intent": "greeting" | "discovery" | "ready_for_engine" | "follow_up" | "emotional_support",
  "reply": "your natural message to the student (2-4 sentences, warm, specific)",
  "extracted": {
    "college": "string or null",
    "branch": "string or null",
    "year": "string or null",
    "cgpa": "string or null",
    "goal": "string or null",
    "gap": "string or null",
    "timeline": "string or null",
    "constraints": "string or null",
    "emotion": "anxious" | "confident" | "neutral" | "lost" | "excited" | null
  },
  "should_trigger_engine": true or false,
  "engine_query": "refined query for mentor matching, or null",
  "missing_critical": ["list of layers still needed, or empty array"],
  "confidence": 0.0 to 1.0
}`;

    const payload = {
      model: GROQ_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-12), // last 12 turns = plenty of context
      ],
      temperature: 0.7,
      max_tokens: 600,
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
      console.error('Groq agent error:', err);
      return res.status(502).json({ error: 'Groq request failed' });
    }

    const data = await groqRes.json();
    const raw = data.choices?.[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error('Invalid JSON from Groq:', raw);
      return res.json({
        intent: 'discovery',
        reply: "Tell me a bit more — which college are you at, what year, and what are you trying to figure out?",
        extracted: {},
        should_trigger_engine: false,
        engine_query: null,
        missing_critical: [],
        confidence: 0.3,
      });
    }

    const extracted = parsed.extracted || {};

    // ── Build the structured problem statement once the context is rich enough ──
    // This is what the matching engine consumes — not the loose engine_query.
    const ready = isEngineReady(extracted, profile);
    const problem = (parsed.should_trigger_engine || ready)
      ? generateProblemStatement(extracted, profile)
      : null;

    return res.json({
      intent: parsed.intent || 'discovery',
      reply: typeof parsed.reply === 'string' ? parsed.reply.trim() : "What's on your mind?",
      extracted,
      // Only trust the engine trigger when the structured statement is genuinely ready
      should_trigger_engine: !!parsed.should_trigger_engine && ready,
      // engine_query is the clean brief (no Confidence line) — feed THIS to the engine
      engine_query: problem ? problem.engineText : (parsed.engine_query || null),
      problemStatement: problem ? problem.statement : null,
      problemConfidence: problem ? problem.confidence : null,
      layersFilled: problem ? problem.layersFilled : 0,
      missing_critical: problem
        ? problem.missing
        : (Array.isArray(parsed.missing_critical) ? parsed.missing_critical : []),
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    });

  } catch (error) {
    console.error('Agent turn error:', error);
    return res.json({
      intent: 'discovery',
      reply: "Hmm, something glitched. What were you asking about?",
      extracted: {},
      should_trigger_engine: false,
      engine_query: null,
      missing_critical: [],
      confidence: 0.3,
    });
  }
});
