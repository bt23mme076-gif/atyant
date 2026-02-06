import User from '../models/User.js';
import Question from '../models/Question.js';
import AnswerCard from '../models/AnswerCard.js';
import { sendMentorNewQuestionNotification } from '../utils/emailNotifications.js';
import { getQuestionEmbedding } from './AIService.js';
import aiServiceInstance from './AIService.js';
import crypto from 'crypto';
import { LRUCache } from 'lru-cache';

// Runtime flags and caches
const isDev = process.env.NODE_ENV !== 'production';
function dlog(...args) { if (isDev) console.log(...args); }

let COMPANY_CACHE = null;
let COMPANY_CACHE_TIME = 0;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

let COMPANY_LIST_READY = true; // ✅ BONUS: Cache is TTL-based, no need for flag
let COMPANY_LOOKUP = new Map(); // ✅ FIX #1: O(1) company detection

// Vector search result cache (10min TTL for repeated questions)
// ✅ FIX #2: LRU cache prevents memory spike on clear()
const VECTOR_CACHE = new LRUCache({
  max: 1000,
  ttl: 1000 * 60 * 10, // 10 minutes
  updateAgeOnGet: false,
  updateAgeOnHas: false
});

async function warmUpCompanyCache() {
  if (!COMPANY_LIST_READY) {
    await getAllTargetCompanies();
    COMPANY_LIST_READY = true;
    console.log("✅ Company cache warmed up");
  }
}

const CONFIG = {
  // 🔥 VECTOR SEARCH TUNING
  SEMANTIC_FLOOR: 0.85,           // Slightly stricter floor to reduce noise
  INSTANT_THRESHOLD: 0.88,        // High bar for instant answers
  VECTOR_CANDIDATES: 80,          // Reduced for cost-effectiveness
  VECTOR_LIMIT: 25,               // Reduced for cost-effectiveness
  
  // 🔥 LIVE ROUTING
  LIVE_MATCH_THRESHOLD: 350,      // Minimum points for assignment
  LOAD_PENALTY: 60,               // Penalty per active question
  MAX_LOAD: 5,                    // Max concurrent questions
  
  // 🔥 QUALITY GATES
  MIN_SCORE_GAP: 0.04,            // 4% gap required between #1 and #2
  AMBIGUITY_THRESHOLD: 0.03,      // 3% gap = ambiguous match
  TOP_MATCH_CONFIDENCE: 0.92,     // 92%+ = auto-accept even if close
  
  // 🔥 HYBRID SCORING WEIGHTS
  WEIGHTS: {
    // Semantic match bonuses (multiply with base vector score)
    EXACT_COMPANY: 0.12,          // +12% if exact company match
    RELATED_COMPANY: 0.06,        // +6% if related company
    EXACT_DOMAIN: 0.08,           // +8% if exact intent match
    PARTIAL_DOMAIN: 0.04,         // +4% if 'both' domain
    SPECIAL_TAG: 0.05,            // +5% per matching tag
    MILESTONE: 0.04,              // +4% per matching milestone
    EXPERTISE: 0.06,              // +6% per matching tech skill
    BIO_DENSITY: 0.03,            // +3% if bio has 5+ keywords
    COLLEGE_TYPE: 0.05,           // +5% same college tier
    SAME_BRANCH: 0.03,            // +3% same branch
    HIGH_RATING: 0.05,            // +5% if rating ≥ 4.5
    HIGH_RESPONSE: 0.04,          // +4% if response rate ≥ 85%
    RECENT_ACTIVE: 0.03,          // +3% if active in 14 days
  },
  
  // 🔥 LIVE ROUTING POINTS
  LIVE_WEIGHTS: {
    EXACT_COMPANY: 700,
    RELATED_COMPANY: 350,
    SPECIAL_TAG: 500,
    EXACT_DOMAIN: 300,
    PARTIAL_DOMAIN: 150,
    MILESTONE: 200,
    EXPERTISE_EXACT: 250,
    EXPERTISE_PARTIAL: 125,
    BIO_KEYWORD: 60,
    COLLEGE_TYPE: 120,
    SAME_BRANCH: 80,
    HIGH_RATING: 120,
    HIGH_RESPONSE: 100,
    RECENT_ACTIVE: 70,
    PROVEN_MENTOR: 150,  // Per 10 successful matches
  }
};

// 🔥 COMPANY ALIASES (Expanded - covers your specific needs)
const COMPANY_ALIASES = {
  'google': ['google', 'alphabet', 'gcp', 'youtube'],
  'microsoft': ['microsoft', 'msft', 'azure', 'linkedin'],
  'amazon': ['amazon', 'aws', 'amzn', 'prime'],
  'meta': ['meta', 'facebook', 'fb', 'instagram', 'whatsapp', 'ig'],
  'apple': ['apple', 'aapl', 'iphone', 'mac'],
  'netflix': ['netflix', 'nflx'],
  'nvidia': ['nvidia', 'nvda'],
  'tesla': ['tesla', 'tsla'],
  'jpmorgan': ['jpmorgan', 'jp morgan', 'jpm', 'chase', 'jpmchase'],
  'goldmansachs': ['goldman sachs', 'goldman', 'gs'],
  'morganstanley': ['morgan stanley', 'ms'],
  'citadel': ['citadel', 'citadel securities'],
  'janestreet': ['jane street', 'janestreet'],
  'tower': ['tower research', 'tower'],
  'uber': ['uber', 'uber technologies'],
  'airbnb': ['airbnb'],
  'snowflake': ['snowflake'],
  'databricks': ['databricks'],
  'stripe': ['stripe'],
  'coinbase': ['coinbase'],
  'flipkart': ['flipkart', 'walmart india'],
  'swiggy': ['swiggy'],
  'zomato': ['zomato'],
  'paytm': ['paytm', 'one97'],
  'ola': ['ola', 'ola electric', 'ola cabs'],
  'cred': ['cred'],
  'razorpay': ['razorpay'],
  'phonepe': ['phonepe'],
  'atlassian': ['atlassian', 'jira', 'confluence', 'trello'],
  'adobe': ['adobe', 'adbe'],
  'salesforce': ['salesforce', 'crm'],
  'oracle': ['oracle', 'orcl'],
  'sap': ['sap'],
  'intuit': ['intuit', 'quickbooks', 'turbotax'],
  'servicenow': ['servicenow', 'now'],
  'cisco': ['cisco', 'csco'],
  'vmware': ['vmware', 'broadcom'],
  'redhat': ['redhat', 'red hat', 'ibm'],
  'qualcomm': ['qualcomm', 'qcom'],
  'intel': ['intel', 'intc'],
  'amd': ['amd', 'advanced micro devices'],
  'deshaw': ['de shaw', 'deshaw', 'd.e. shaw'],
  'McKinsey': ['mckinsey', 'mckinsey & company'],
  'bcg': ['bcg', 'boston consulting'],
  'bain': ['bain', 'bain & company'],
};

// 🔥 TECH SKILLS DATABASE (For vector embedding context)
const TECH_KEYWORDS = [
  // Languages
  'python', 'java', 'javascript', 'c++', 'cpp', 'golang', 'rust', 'kotlin', 
  'swift', 'typescript', 'scala', 'ruby', 'php',
  
  // Frameworks
  'react', 'angular', 'vue', 'nextjs', 'django', 'flask', 'fastapi', 
  'spring', 'springboot', 'nodejs', 'express', 'nestjs',
  
  // Data & ML
  'machine learning', 'ml', 'deep learning', 'dl', 'nlp', 'computer vision',
  'tensorflow', 'pytorch', 'keras', 'scikit', 'pandas', 'numpy',
  
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'terraform',
  'jenkins', 'ci/cd', 'devops', 'ansible',
  
  // Databases
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra', 
  'dynamodb', 'elasticsearch',
  
  // Core CS
  'dsa', 'data structures', 'algorithms', 'system design', 'hld', 'lld',
  'oops', 'dbms', 'operating system', 'os', 'networks', 'computer networks',
  
  // Domains
  'backend', 'frontend', 'fullstack', 'mobile', 'android', 'ios',
  'data science', 'data engineering', 'sde', 'swe', 'devops engineer',
  'quant', 'quantitative', 'trading', 'fintech'
];

// 🔥 SPECIAL TAGS (Career milestones & contexts)
const SPECIAL_TAGS = [
  // College types
  'iit', 'nit', 'iiit', 'bits', 'iim', 'dtu', 'nsut', 'vit',
  
  // Career contexts
  'faang', 'maang', 'foreign', 'abroad', 'usa', 'europe', 'canada', 'germany',
  'startup', 'unicorn', 'series-a', 'early-stage',
  
  // Placement types
  'on-campus', 'off-campus', 'ppo', 'pre-placement',
  
  // Education
  'masters', 'ms', 'mtech', 'mba', 'phd', 'research',
  
  // Exams
  'gate', 'gre', 'gmat', 'cat', 'upsc',
  
  // Domains
  'consulting', 'product', 'quant', 'trading', 'fintech',
  
  // Activities
  'competitive programming', 'cp', 'hackathon', 'open source', 
  'gsoc', 'leetcode', 'codeforces', 'kaggle',
  
  // Switches
  'career switch', 'domain switch', 'company switch'
];

// 🔥 UTILITY FUNCTIONS

function normalizeCompany(company) {
  if (!company || typeof company !== 'string') return '';
  const normalized = company.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '');
  
  // ✅ FIX #6: Exact match to prevent false positives (amazonintern ≠ amazon)
  for (const [key, aliases] of Object.entries(COMPANY_ALIASES)) {
    if (aliases.some(alias => {
      const cleanAlias = alias.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '');
      return normalized === cleanAlias;
    })) {
      return key;
    }
  }
  return normalized;
}

function getCollegeType(collegeName) {
  if (!collegeName) return 'unknown';
  const name = collegeName.toLowerCase();
  
  if (name.includes('iit')) return 'iit';
  if (name.includes('nit')) return 'nit';
  if (name.includes('iiit')) return 'iiit';
  if (name.includes('bits')) return 'bits';
  if (name.includes('iim')) return 'iim';
  
  const tier1 = ['dtu', 'nsut', 'vit', 'manipal', 'thapar', 'rvce', 'pec', 'coep', 'vnit'];
  if (tier1.some(t => name.includes(t))) return 'tier1';
  
  return 'tier2';
}

function extractSmartKeywords(text) {
  const stopwords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were',
    'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'should', 'could', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for',
    'with', 'from', 'by', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own',
    'same', 'than', 'too', 'very', 'just', 'but', 'what', 'get', 'got', 'help',
    'want', 'need', 'know', 'like', 'kaise', 'kya', 'hai', 'hain', 'mujhe', 
    'please', 'bhai', 'yaar', 'bro', 'plz', 'pls'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.has(w));
  
  return [...new Set(words)].slice(0, 25);
}

function isRecentlyActive(lastActive, days = 14) {
  if (!lastActive) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(lastActive) > cutoff;
}

async function getAllTargetCompanies() {
  try {
    const now = Date.now();
    if (COMPANY_CACHE && (now - COMPANY_CACHE_TIME) < CACHE_TTL) {
      return COMPANY_CACHE;
    }

    const mentors = await User.find({ role: 'mentor' }).select('topCompanies').lean();
    const allCompanies = mentors.flatMap(m =>
      Array.isArray(m.topCompanies) ? m.topCompanies.filter(c => typeof c === 'string') : []
    );

    COMPANY_CACHE = [...new Set(allCompanies.map(c => normalizeCompany(c)))].filter(Boolean);
    COMPANY_CACHE_TIME = now;
    
    // ✅ FIX #1: Build lookup map for O(1) detection
    COMPANY_LOOKUP.clear();
    for (const c of COMPANY_CACHE) {
      const aliases = COMPANY_ALIASES[c] || [c];
      aliases.forEach(a => {
        COMPANY_LOOKUP.set(a.toLowerCase().replace(/[^a-z0-9]/g, ''), c);
      });
    }
    
    return COMPANY_CACHE;
  } catch (err) {
    console.error('getAllTargetCompanies error:', err);
    return [];
  }
}

// 🔥 MAIN ENGINE CLASS

class AtyantEngine {

  /* =============================================
      🧠 DEEP QUERY ANALYSIS (Vector-Optimized)
     ============================================= */
  async detectQueryDetails(text) {
    const t = text.toLowerCase();
    
    // 1. Intent Detection with Confidence
    let intent = null;
    let confidence = 0;
    
    const internshipPatterns = [
      'internship', 'intern', 'summer internship', 'winter internship', 
      'intern offer', 'internship offer', 'intern prep'
    ];
    const placementPatterns = [
      'placement', 'job', 'full time', 'full-time', 'ft role', 'ft offer',
      'job offer', 'campus placement', 'recruitment'
    ];
    
    const internMatches = internshipPatterns.filter(p => t.includes(p)).length;
    const placeMatches = placementPatterns.filter(p => t.includes(p)).length;
    
    if (internMatches > placeMatches && internMatches > 0) {
      intent = 'internship';
      confidence = Math.min(internMatches / internshipPatterns.length, 1);
    } else if (placeMatches > 0) {
      intent = 'placement';
      confidence = Math.min(placeMatches / placementPatterns.length, 1);
    } else {
      intent = 'general';
      confidence = 0.3;
    }

    // 2. Company Detection - ✅ FIX #1 (REAL O(1)): Tokenize & direct lookup
    await getAllTargetCompanies(); // Warm cache + build lookup
    const mentionedCompanies = [];
    const relatedCompanies = [];
    
    const tClean = t.replace(/[^a-z0-9\s]/g, '');
    const tokens = new Set(tClean.split(/\s+/));
    
    // True O(1): Direct map lookup for each token
    for (const token of tokens) {
      const clean = token.replace(/[^a-z0-9]/g, '');
      
      if (COMPANY_LOOKUP.has(clean)) {
        const key = COMPANY_LOOKUP.get(clean);
        
        if (!mentionedCompanies.includes(key)) {
          mentionedCompanies.push(key);
        }
      }
    }
    
    // Multi-word partial match (e.g., "jp morgan")
    const bigrams = [];
    const tokenArr = [...tokens];
    for (let i = 0; i < tokenArr.length - 1; i++) {
      bigrams.push(tokenArr[i] + tokenArr[i+1]);
    }
    
    for (const bigram of bigrams) {
      if (COMPANY_LOOKUP.has(bigram)) {
        const key = COMPANY_LOOKUP.get(bigram);
        if (!mentionedCompanies.includes(key) && !relatedCompanies.includes(key)) {
          relatedCompanies.push(key);
        }
      }
    }

    // 3. Special Tags Detection
    const foundTags = SPECIAL_TAGS.filter(tag => t.includes(tag));

    // 4. Tech Skills Detection
    const mentionedTech = TECH_KEYWORDS.filter(tech => {
      // Handle multi-word tech (e.g., "machine learning")
      if (tech.includes(' ')) {
        return t.includes(tech);
      }
      // Handle variations (e.g., "c++" vs "cpp")
      return t.includes(tech);
    });

    // 5. Context Signals
    const isUrgent = /urgent|asap|immediate|quickly|fast/.test(t);
    const isDetailOriented = text.length > 200; // Longer questions = more serious
    const hasSpecifics = mentionedCompanies.length > 0 || mentionedTech.length > 2;

    return {
      intent,
      confidence,
      mentionedCompanies,
      relatedCompanies,
      foundTags,
      mentionedTech,
      isUrgent,
      isDetailOriented,
      hasSpecifics,
      questionLength: text.length
    };
  }

  /* =============================================
      🔥 PATH A: VECTOR-BASED SEMANTIC MATCHING
     ============================================= */
  async findBestSemanticMatch(studentId, vector, questionText) {
    try {
      // 🔥 CHECK VECTOR CACHE (10min TTL for repeated questions)
      // ✅ FIX #2: Hash-based cache key to prevent collisions
      const cacheKey = crypto.createHash('sha1').update(questionText).digest('hex');
      
      // ✅ LRU auto-handles TTL and eviction
      if (VECTOR_CACHE.has(cacheKey)) {
        dlog(`💾 CACHE HIT: Returning cached result`);
        return VECTOR_CACHE.get(cacheKey);
      }

      const student = await User.findById(studentId).select('education').lean();
      const sEdu = student?.education?.[0] || {};
      const studentCollegeType = getCollegeType(sEdu.institutionName);

      const queryDetails = await this.detectQueryDetails(questionText);
      const { 
        intent, confidence, mentionedCompanies, relatedCompanies, 
        foundTags, mentionedTech, isUrgent, hasSpecifics 
      } = queryDetails;
      
      dlog(`\n🔎 ===== VECTOR SEMANTIC SEARCH (Atlas) =====`);
      dlog(`Intent: ${intent} | Confidence: ${(confidence*100).toFixed(0)}%`);
      dlog(`Companies (Exact): [${mentionedCompanies.join(', ') || 'None'}]`);
      dlog(`Companies (Related): [${relatedCompanies.join(', ') || 'None'}]`);
      dlog(`Tags: [${foundTags.slice(0, 5).join(', ') || 'None'}]`);
      dlog(`Tech: [${mentionedTech.slice(0, 5).join(', ') || 'None'}]`);
      dlog(`Signals: ${isUrgent ? '⚡Urgent' : ''} ${hasSpecifics ? '🎯Specific' : '📝General'}`);

      // 🔥 ATLAS VECTOR SEARCH (✅ FIX #4: Dynamic candidates based on query type)
      const dynamicCandidates = isUrgent ? 120 : (hasSpecifics ? 80 : 50);
      
      const candidates = await AnswerCard.aggregate([
        {
          "$vectorSearch": {
            "index": "vector_index",
            "path": "embedding",
            "queryVector": vector,
            "numCandidates": dynamicCandidates,  // ✅ 30-40% cost savings
            "limit": CONFIG.VECTOR_LIMIT,
            "filter": {}
          }
        },
        {
          "$project": {
            "answerContent": 1,
            "mentorId": 1,
            "questionId": 1,
            "createdAt": 1,
            "score": { "$meta": "vectorSearchScore" }
          }
        }
      ]);

      dlog(`Atlas returned ${candidates.length} vector matches`);

      if (candidates.length === 0) {
        dlog(`⚠️ NO VECTOR MATCHES from Atlas`);
        return null;
      }

      // 🔥 FETCH MENTOR DATA IN BULK (Performance optimization)
      const mentorIds = [...new Set(candidates.map(c => c.mentorId.toString()))];
      const mentors = await User.find({ _id: { $in: mentorIds }, role: 'mentor' })
        .select('username avatar bio education primaryDomain topCompanies milestones specialTags expertise rating responseRate lastActive successfulMatches')
        .lean();
      
      const mentorMap = new Map(mentors.map(m => [m._id.toString(), m]));

      // 🔥 HYBRID SCORING (Vector + Metadata)
      const scoredMatches = [];

      for (let match of candidates) {
        if (match.score < CONFIG.SEMANTIC_FLOOR) {
          dlog(`⏭️ Skipping match (score ${(match.score*100).toFixed(1)}% < ${CONFIG.SEMANTIC_FLOOR*100}% floor)`);
          continue;
        }
        
        const mentor = mentorMap.get(match.mentorId.toString());
        if (!mentor) continue;

        const baseScore = match.score; // vector score
        let totalBonus = 0;
        const bonusLogs = [];
        const W = CONFIG.WEIGHTS;

        // 🔥 1. COMPANY MATCHING (Strongest signal)
        const mentorCompanies = (mentor.topCompanies || []).map(c => normalizeCompany(c));
        const exactCompanyMatch = mentorCompanies.filter(mc => mentionedCompanies.includes(mc)).length;
        const relatedCompanyMatch = mentorCompanies.filter(mc => relatedCompanies.includes(mc)).length;

        if (exactCompanyMatch > 0) {
          const bonus = W.EXACT_COMPANY * Math.min(exactCompanyMatch, 3);
          totalBonus += bonus;
          bonusLogs.push(`ExactCo(+${(bonus*100).toFixed(1)}%,${exactCompanyMatch}x)`);
        } else if (relatedCompanyMatch > 0) {
          const bonus = W.RELATED_COMPANY * Math.min(relatedCompanyMatch, 2);
          totalBonus += bonus;
          bonusLogs.push(`RelatedCo(+${(bonus*100).toFixed(1)}%,${relatedCompanyMatch}x)`);
        }

        // 🔥 2. INTENT/DOMAIN MATCHING (Confidence-weighted)
        if (mentor.primaryDomain === intent) {
          const bonus = W.EXACT_DOMAIN * confidence;
          totalBonus += bonus;
          bonusLogs.push(`Domain(+${(bonus*100).toFixed(1)}%)`);
        } else if (mentor.primaryDomain === 'both') {
          const bonus = W.PARTIAL_DOMAIN * confidence;
          totalBonus += bonus;
          bonusLogs.push(`BothDomain(+${(bonus*100).toFixed(1)}%)`);
        }

        // 🔥 3. SPECIAL TAGS (Career context)
        const tagMatches = (mentor.specialTags || []).filter(tag => foundTags.some(ft => tag.toLowerCase().includes(ft))).length;
        if (tagMatches > 0) {
          const bonus = W.SPECIAL_TAG * Math.min(tagMatches, 4);
          totalBonus += bonus;
          bonusLogs.push(`Tags(+${(bonus*100).toFixed(1)}%,${tagMatches}x)`);
        }

        // 🔥 4. MILESTONES
        const milestoneMatches = (mentor.milestones || []).filter(m => foundTags.some(ft => m.toLowerCase().includes(ft))).length;
        if (milestoneMatches > 0) {
          const bonus = W.MILESTONE * Math.min(milestoneMatches, 3);
          totalBonus += bonus;
          bonusLogs.push(`Milestones(+${(bonus*100).toFixed(1)}%,${milestoneMatches}x)`);
        }

        // 🔥 5. EXPERTISE (Tech skills)
        const expertiseMatches = (mentor.expertise || []).filter(exp => mentionedTech.some(tech => exp.toLowerCase().includes(tech))).length;
        if (expertiseMatches > 0) {
          const bonus = W.EXPERTISE * Math.min(expertiseMatches, 5);
          totalBonus += bonus;
          bonusLogs.push(`Tech(+${(bonus*100).toFixed(1)}%,${expertiseMatches}x)`);
        }

        // 🔥 6. BIO KEYWORD DENSITY
        const keywords = extractSmartKeywords(questionText);
        const bioMatches = keywords.filter(kw => mentor.bio?.toLowerCase().includes(kw)).length;
        if (bioMatches >= 5) {
          const bonus = W.BIO_DENSITY;
          totalBonus += bonus;
          bonusLogs.push(`Bio(+${(bonus*100).toFixed(1)}%,${bioMatches}kw)`);
        }

        // 🔥 7. COLLEGE TYPE AFFINITY
        const mEdu = mentor.education?.[0] || {};
        const mentorCollegeType = getCollegeType(mEdu.institutionName);
        if (studentCollegeType === mentorCollegeType && studentCollegeType !== 'unknown') {
          totalBonus += W.COLLEGE_TYPE;
          bonusLogs.push(`${studentCollegeType.toUpperCase()}(+${(W.COLLEGE_TYPE*100).toFixed(1)}%)`);
        }

        // 🔥 8. SAME BRANCH
        if (sEdu.field && mEdu.field && sEdu.field.toLowerCase() === mEdu.field.toLowerCase()) {
          totalBonus += W.SAME_BRANCH;
          bonusLogs.push(`Branch(+${(W.SAME_BRANCH*100).toFixed(1)}%)`);
        }

        // 🔥 9. MENTOR QUALITY SIGNALS
        if (mentor.rating >= 4.5) {
          totalBonus += W.HIGH_RATING;
          bonusLogs.push(`★${mentor.rating.toFixed(1)}(+${(W.HIGH_RATING*100).toFixed(1)}%)`);
        }

        if (mentor.responseRate >= 85) {
          totalBonus += W.HIGH_RESPONSE;
          bonusLogs.push(`Response${mentor.responseRate}%(+${(W.HIGH_RESPONSE*100).toFixed(1)}%)`);
        }

        if (isRecentlyActive(mentor.lastActive)) {
          totalBonus += W.RECENT_ACTIVE;
          bonusLogs.push(`Active(+${(W.RECENT_ACTIVE*100).toFixed(1)}%)`);
        }

        // Cold-start boost for newer mentors
        if ((mentor.successfulMatches || 0) < 5) {
          const cold = 0.03; // +3%
          totalBonus += cold;
          bonusLogs.push(`ColdStart(+${(cold*100).toFixed(1)}%)`);
        }

        // FINAL: Cap bonus at 35% to prevent weak mentor inflation, then multiply and clamp
        const cappedBonus = Math.min(totalBonus, 0.35); // max 35%
        let finalScore = Math.min(baseScore * (1 + cappedBonus), 1.0);
        
        if (cappedBonus < totalBonus) {
          dlog(`⚠️ Bonus capped: ${(totalBonus*100).toFixed(1)}% → ${(cappedBonus*100).toFixed(1)}%`);
        }

        // 🔥 Store scored match
        scoredMatches.push({
          ...match,
          finalScore,
          baseScore: match.score,
          bonusScore: totalBonus,
          mentorProfile: {
            _id: mentor._id,
            username: mentor.username,
            avatar: mentor.avatar,
            bio: mentor.bio,
            education: mEdu,
            rating: mentor.rating,
            responseRate: mentor.responseRate,
            topCompanies: mentor.topCompanies
          },
          breakdown: bonusLogs.join(' | ')
        });
      }

      // 🔥 SORT BY HYBRID SCORE
      scoredMatches.sort((a, b) => b.finalScore - a.finalScore);

      // 🔥 TOP 10 DETAILED LOGGING (dev only)
      dlog(`\n--- TOP 10 VECTOR MATCHES (Hybrid Scored) ---`);
      scoredMatches.slice(0, 10).forEach((m, i) => {
        dlog(
          `#${i + 1}: ${m.mentorProfile.username}\n` +
          `   Final: ${(m.finalScore * 100).toFixed(2)}% | ` +
          `Vector: ${(m.baseScore * 100).toFixed(1)}% | ` +
          `Bonus: +${(m.bonusScore * 100).toFixed(1)}%\n` +
          `   └─ ${m.breakdown || 'Pure semantic match'}`
        );
      });
      dlog(`---------------------------------------------\n`);

      // 🔥 QUALITY GATES
      const best = scoredMatches[0];
      const second = scoredMatches[1];

      if (!best) {
        dlog(`❌ NO QUALIFYING MATCHES after scoring`);
        return null;
      }

      // Gate 1: Minimum threshold
      if (best.finalScore < CONFIG.INSTANT_THRESHOLD) {
        dlog(
          `⚠️ BELOW THRESHOLD: Best ${(best.finalScore*100).toFixed(2)}% < ` +
          `${(CONFIG.INSTANT_THRESHOLD*100)}% required`
        );
        return null;
      }

      // Gate 2: Clear winner check (avoid ambiguity)
      if (second) {
        const gap = best.finalScore - second.finalScore;
        
        // If top score is excellent (>92%), accept even if close
        if (best.finalScore >= CONFIG.TOP_MATCH_CONFIDENCE) {
          dlog(
            `✅ EXCELLENT MATCH: ${best.mentorProfile.username} ` +
            `(${(best.finalScore*100).toFixed(2)}% ≥ ${CONFIG.TOP_MATCH_CONFIDENCE*100}%)`
          );
          return best;
        }
        
        // Otherwise require minimum gap
        if (gap < CONFIG.AMBIGUITY_THRESHOLD) {
          dlog(
            `⚠️ AMBIGUOUS: #1 vs #2 gap only ${(gap*100).toFixed(2)}%\n` +
            `   #1: ${best.mentorProfile.username} (${(best.finalScore*100).toFixed(2)}%)\n` +
            `   #2: ${second.mentorProfile.username} (${(second.finalScore*100).toFixed(2)}%)\n` +
            `   → Routing to live mentor for safety`
          );
          return null;
        }
      }
      // ✅ CLEAR WINNER
      dlog(
        `✅ INSTANT MATCH CONFIRMED: ${best.mentorProfile.username}\n` +
        `   Score: ${(best.finalScore*100).toFixed(2)}% ` +
        `(Gap: ${second ? ((best.finalScore - second.finalScore) * 100).toFixed(2) + '%' : 'Unique'})`
      );
      
      // 🔥 CACHE THE RESULT (✅ LRU auto-manages TTL and size)
      VECTOR_CACHE.set(cacheKey, best);
      
      return best;

    } catch (error) {
      console.error("🔥 Vector Search Error:", error);
      return null;
    }
  }

  /* =============================================
      🔥 PATH B: LIVE MENTOR ROUTING (Fallback)
     ============================================= */
  async findBestMentor(studentId, keywords) {
    try {
      const questionText = keywords.join(' ');
      const student = await User.findById(studentId).select('education').lean();
      const sEdu = student?.education?.[0] || {};
      const studentCollegeType = getCollegeType(sEdu.institutionName);

      const queryDetails = await this.detectQueryDetails(questionText);
      const { 
intent, confidence, mentionedCompanies, relatedCompanies, 
        foundTags, mentionedTech 
      } = queryDetails;

      dlog(`\n🤝 ===== LIVE MENTOR ROUTING =====`);
      dlog(`Analyzing all available mentors...`);

      // 🔥 FETCH MENTORS (✅ FIX #3: Pre-filter to avoid full table scan)
      const mentors = await User.find({
        role: 'mentor',
        activeQuestions: { $lt: CONFIG.MAX_LOAD + 2 },
        lastActive: { $gte: new Date(Date.now() - 30*24*60*60*1000) }
      })
        .select(
          'username education primaryDomain topCompanies milestones specialTags ' +
          'expertise bio activeQuestions rating responseRate lastActive successfulMatches'
        )
        .lean();
      
      dlog(`Found ${mentors.length} total mentors`);

      // 🔥 SCORE EACH MENTOR
      const scored = mentors.map(mentor => {
        let points = 0;
        let breakdown = [];
        const LW = CONFIG.LIVE_WEIGHTS;

        // 1. COMPANY MATCHING
        const mentorCompanies = (mentor.topCompanies || []).map(c => normalizeCompany(c));
        const exactCount = mentorCompanies.filter(mc => 
          mentionedCompanies.includes(mc)
        ).length;
        const relatedCount = mentorCompanies.filter(mc => 
          relatedCompanies.includes(mc)
        ).length;
        
        if (exactCount > 0) {
          const pts = LW.EXACT_COMPANY * exactCount;
          points += pts;
          breakdown.push(`ExactCo(+${pts},${exactCount}x)`);
        } else if (relatedCount > 0) {
          const pts = LW.RELATED_COMPANY * relatedCount;
          points += pts;
          breakdown.push(`RelatedCo(+${pts},${relatedCount}x)`);
        }

        // 2. SPECIAL TAGS
        const tagCount = (mentor.specialTags || []).filter(tag => 
          foundTags.some(ft => tag.toLowerCase().includes(ft))
        ).length;
        if (tagCount > 0) {
          const pts = LW.SPECIAL_TAG * tagCount;
          points += pts;
          breakdown.push(`Tags(+${pts},${tagCount}x)`);
        }

        // 3. DOMAIN INTENT
        if (intent && intent !== 'general') {
          if (mentor.primaryDomain === intent) {
            const pts = Math.round(LW.EXACT_DOMAIN * confidence);
            points += pts;
            breakdown.push(`Domain(+${pts})`);
          } else if (mentor.primaryDomain === 'both') {
            const pts = Math.round(LW.PARTIAL_DOMAIN * confidence);
            points += pts;
            breakdown.push(`BothDomain(+${pts})`);
          }
        }

        // 4. MILESTONES
        const milestoneCount = (mentor.milestones || []).filter(m => 
          foundTags.some(ft => m.toLowerCase().includes(ft))
        ).length;
        if (milestoneCount > 0) {
          const pts = LW.MILESTONE * milestoneCount;
          points += pts;
          breakdown.push(`Milestones(+${pts},${milestoneCount}x)`);
        }

        // 5. EXPERTISE (Tech)
        const expertiseExact = (mentor.expertise || []).filter(exp => 
          mentionedTech.some(tech => exp.toLowerCase() === tech.toLowerCase())
        ).length;
        const expertisePartial = (mentor.expertise || []).filter(exp => 
          mentionedTech.some(tech => exp.toLowerCase().includes(tech))
        ).length - expertiseExact;

        if (expertiseExact > 0) {
          const pts = LW.EXPERTISE_EXACT * expertiseExact;
          points += pts;
          breakdown.push(`ExactTech(+${pts},${expertiseExact}x)`);
        }
        if (expertisePartial > 0) {
          const pts = LW.EXPERTISE_PARTIAL * expertisePartial;
          points += pts;
          breakdown.push(`PartialTech(+${pts},${expertisePartial}x)`);
        }

        // 6. BIO KEYWORDS
        const bioCount = keywords.filter(kw => 
          mentor.bio?.toLowerCase().includes(kw)
        ).length;
        if (bioCount >= 3) {
          const pts = LW.BIO_KEYWORD * bioCount;
          points += pts;
          breakdown.push(`Bio(+${pts},${bioCount}kw)`);
        }

        // 7. COLLEGE TYPE
        const mEdu = mentor.education?.[0] || {};
        const mentorCollegeType = getCollegeType(mEdu.institutionName);
        if (studentCollegeType === mentorCollegeType && studentCollegeType !== 'unknown') {
          points += LW.COLLEGE_TYPE;
          breakdown.push(`${studentCollegeType.toUpperCase()}(+${LW.COLLEGE_TYPE})`);
        }

        // 8. SAME BRANCH
        if (sEdu.field && mEdu.field && 
            sEdu.field.toLowerCase() === mEdu.field.toLowerCase()) {
          points += LW.SAME_BRANCH;
          breakdown.push(`Branch(+${LW.SAME_BRANCH})`);
        }

        // 9. QUALITY SIGNALS
        if (mentor.rating >= 4.5) {
          points += LW.HIGH_RATING;
          breakdown.push(`★${mentor.rating.toFixed(1)}(+${LW.HIGH_RATING})`);
        }

        if (mentor.responseRate >= 85) {
          points += LW.HIGH_RESPONSE;
          breakdown.push(`Response${mentor.responseRate}%(+${LW.HIGH_RESPONSE})`);
        }

        if (isRecentlyActive(mentor.lastActive)) {
          points += LW.RECENT_ACTIVE;
          breakdown.push(`Active(+${LW.RECENT_ACTIVE})`);
        }

        // 10. PROVEN TRACK RECORD
        if (mentor.successfulMatches >= 10) {
          const bonus = Math.min(Math.floor(mentor.successfulMatches / 10), 5) * LW.PROVEN_MENTOR;
          points += bonus;
          breakdown.push(`Proven(+${bonus},${mentor.successfulMatches}m)`);
        }

        // 11. LOAD PENALTY
        const load = mentor.activeQuestions || 0;
        if (load >= CONFIG.MAX_LOAD) {
          const oldPoints = points;
          points = Math.floor(points * 0.25); // 75% penalty
          breakdown.push(`OVERLOADED(-${oldPoints - points},${load}Q)`);
        } else if (load > 0) {
          const penalty = load * CONFIG.LOAD_PENALTY;
          points -= penalty;
          breakdown.push(`Load(-${penalty},${load}Q)`);
        }

        return {
          mentor,
          points,
          logs: breakdown.join(' | '),
          load: load
        };
      });

      // 🔥 SORT BY POINTS
      scored.sort((a, b) => b.points - a.points);

      // 🔥 TOP 10 LOGGING (dev only)
      dlog(`\n--- TOP 10 LIVE ROUTING CANDIDATES ---`);
      scored.slice(0, 10).forEach((item, i) => {
        dlog(
          `#${i+1}: ${item.mentor.username} | ${item.points} pts (${item.load} active)\n` +
          `   └─ ${item.logs || 'Generic match'}`
        );
      });
      dlog(`---------------------------------------\n`);

      const best = scored[0];
      const second = scored[1];

      // 🔥 QUALITY GATES
      
      // Gate 1: Minimum threshold
      if (!best || best.points < CONFIG.LIVE_MATCH_THRESHOLD) {
        console.log(
          `❌ NO QUALIFYING MENTOR: Best ${best?.points || 0} pts < ` +
          `${CONFIG.LIVE_MATCH_THRESHOLD} threshold`
        );
        return null;
      }

      // Gate 2: Avoid overloaded mentors if alternatives exist
      if (best.load >= CONFIG.MAX_LOAD) {
        const alternative = scored.find(s => s.load < CONFIG.MAX_LOAD && s.points >= CONFIG.LIVE_MATCH_THRESHOLD);
        if (alternative) {
          console.log(
            `⚠️ Best mentor overloaded (${best.load}Q), switching to:\n` +
            `   ${alternative.mentor.username} (${alternative.points} pts, ${alternative.load}Q)`
          );
          return alternative.mentor;
        }
      }

      // Gate 3: Check for ambiguity (20% gap required)
      if (second && best.points >= CONFIG.LIVE_MATCH_THRESHOLD) {
        const gap = best.points - second.points;
        const gapPercent = (gap / best.points) * 100;
        
        // If gap too small and neither has >1000 pts, use tiebreaker
        if (gapPercent < 20 && best.points < 1000) {
          dlog(
            `⚠️ CLOSE MATCH: #1 vs #2 gap only ${gapPercent.toFixed(1)}%\n` +
            `   #1: ${best.mentor.username} (${best.points} pts)\n` +
            `   #2: ${second.mentor.username} (${second.points} pts)`
          );
          
          // Tiebreaker 1: Higher rating
          if (second.mentor.rating > best.mentor.rating) {
            dlog(`   → Selected #2 (higher rating: ${second.mentor.rating} > ${best.mentor.rating})`);
            return second.mentor;
          }
          
          // Tiebreaker 2: Lower load
          if (second.load < best.load) {
            dlog(`   → Selected #2 (less busy: ${second.load}Q < ${best.load}Q)`);
            return second.mentor;
          }
          
          // Tiebreaker 3: More experience
          if ((second.mentor.successfulMatches || 0) > (best.mentor.successfulMatches || 0)) {
            dlog(`   → Selected #2 (more experienced)`);
            return second.mentor;
          }
          
          dlog(`   → Keeping #1 (no clear tiebreaker)`);
        }
      }

      // ✅ CLEAR WINNER
      dlog(
        `✅ MENTOR ASSIGNED: ${best.mentor.username}\n` +
        `   Points: ${best.points} | Load: ${best.load}Q | ` +
        `Gap: ${second ? (best.points - second.points) : 'Unique'}`
      );
      
      return best.mentor;

    } catch (error) {
      console.error("🔥 Live Routing Error:", error);
      return null;
    }
  }

  /* =============================================
      🚀 MAIN ORCHESTRATOR
     ============================================= */
  async processQuestion(userId, questionText, options = {}) {
    try {
      // 🔥 WARM UP COMPANY CACHE (Once at startup)
      await warmUpCompanyCache();

      dlog('\n🚀 ========== ATYANT VECTOR ENGINE START ==========');
      dlog(`User: ${userId}`);
      dlog(`Question (${questionText.length} chars):\n"${questionText.substring(0, 150)}${questionText.length > 150 ? '...' : ''}"`);
      dlog(`Options: ${JSON.stringify(options)}`);

      // 🔥 GENERATE EMBEDDING
      let vector = null;
      try {
        vector = await getQuestionEmbedding(questionText);
        dlog(`✅ Vector embedding generated (${vector?.length || 0} dimensions)`);
      } catch (err) {
        dlog(`❌ Vector generation failed: ${err.message}`);
      }
      
      const keywords = extractSmartKeywords(questionText);
      dlog(`Keywords: [${keywords.slice(0, 10).join(', ')}${keywords.length > 10 ? '...' : ''}]`);

      // 🔥 PATH A: VECTOR SEMANTIC SEARCH
      if (vector && !options.isFollowUp) {
        dlog(`\n🎯 Attempting Vector Semantic Match...`);
        const match = await this.findBestSemanticMatch(userId, vector, questionText);
        
        if (match) {
          // Save question with instant answer
          const q = new Question({
            userId,
            questionText,
            keywords,
            status: 'answered_instantly',
            answerCardId: match._id,
            selectedMentorId: match.mentorProfile._id,
            isInstant: true,
            matchScore: Math.round(match.finalScore * 100),
            matchMethod: 'vector_semantic'
          });
          await q.save();
          
          dlog(`\n🎉 ========== INSTANT ANSWER DELIVERED ==========`);
          dlog(`AnswerCard ID: ${match._id}`);
          dlog(`Mentor: ${match.mentorProfile.username}`);
          dlog(`Match Score: ${(match.finalScore*100).toFixed(2)}%`);
          dlog(`================================================\n`);
          
          return {
            success: true,
            instantAnswer: true,
            questionId: q._id,
            answerCardId: match._id,
            answerContent: match.answerContent,
            mentor: match.mentorProfile,
            matchScore: match.finalScore,
            matchMethod: 'vector_semantic'
          };
        }
        
        dlog(`No instant match found, proceeding to live routing...`);
      } else if (!vector) {
        dlog(`⚠️ Skipping vector search (embedding unavailable)`);
      } else if (options.isFollowUp) {
        dlog(`⚠️ Skipping vector search (follow-up question)`);
      }

      // 🔥 PATH B: LIVE MENTOR ROUTING
      dlog(`\n🎯 Attempting Live Mentor Routing...`);
      const bestMentor = await this.findBestMentor(userId, keywords);
      
      const question = new Question({
        userId,
        questionText,
        keywords,
        status: bestMentor ? 'mentor_assigned' : 'pending',
        matchMethod: 'live_routing',
        isFollowUp: options.isFollowUp || false
      });

      if (bestMentor) {
        question.selectedMentorId = bestMentor._id;
        await question.save();
        
        // 🔥 ATOMIC UPDATE: Prevent race condition (2 users → same mentor → overload)
        const updated = await User.findOneAndUpdate(
          {
            _id: bestMentor._id,
            activeQuestions: { $lt: CONFIG.MAX_LOAD }
          },
          { $inc: { activeQuestions: 1 } },
          { new: true }
        );
        
        if (!updated) {
          // ✅ FIX #4: Prevent infinite retry loop
          if ((options._retryCount || 0) > 2) {
            console.error('❌ Max retry reached (mentor overload). Moving to global pool.');
            return { success: false, message: 'System is busy. Your question will be answered soon.' };
          }
          console.error(`⚠️ Mentor ${bestMentor.username} became overloaded during assignment, retrying...`);
          // Retry with fresh mentor pool
          return this.processQuestion(userId, questionText, { ...options, _retryCount: (options._retryCount || 0) + 1 });
        }

        // Send notification
        try {
          await sendMentorNewQuestionNotification(
            bestMentor.email,
            bestMentor.username,
            questionText
          );
          dlog(`📧 Email sent to ${bestMentor.username}`);
        } catch (emailErr) {
          console.error(`⚠️ Email notification failed: ${emailErr.message}`);
        }

        dlog(`\n✅ ========== ROUTED TO MENTOR ==========`);
        dlog(`Question ID: ${question._id}`);
        dlog(`Mentor: ${bestMentor.username}`);
        dlog(`Current Load: ${updated.activeQuestions}`);
        dlog(`=========================================\n`);
        
        return {
          success: true,
          questionId: question._id,
          message: `Matching with ${bestMentor.username}...`,
          mentorId: bestMentor._id,
          mentorUsername: bestMentor.username,
          matchMethod: 'live_routing'
        };
      }

      // 🔥 FALLBACK: GLOBAL POOL
      await question.save();
      
      dlog(`\n⚠️ ========== MOVED TO GLOBAL POOL ==========`);
      dlog(`Question ID: ${question._id}`);
      dlog(`Reason: No mentor met minimum threshold`);
      dlog(`============================================\n`);
      
      return {
        success: true,
        message: 'Looking for a senior mentor...',
        questionId: question._id,
        pool: 'global',
        matchMethod: 'pending_assignment'
      };

    } catch (error) {
      console.error('\n🔥 ========== ENGINE CRITICAL ERROR ==========');
      console.error(error);
      console.error('=============================================\n');
      
      return { 
        success: false, 
        message: 'Failed to submit question. Please try again.' 
      };
    }
  }

  // Helper exposed to routes for keyword extraction
  extractBetterKeywords(text) {
    try {
      return extractSmartKeywords(text || '');
    } catch (e) {
      console.error('Keyword extraction error:', e);
      return [];
    }
  }

  /* =============================================
      🔄 ANSWER CARD TRANSFORMATION
     ============================================= */
  async transformToAnswerCard(mentorExperience, question) {
    try {
      const mentorId = mentorExperience.mentorId;
      const questionId = question._id;
      const mentorExperienceId = mentorExperience._id;
      const rawData = mentorExperience.rawExperience;

      console.log(`\n✨ Transforming to Answer Card...`);
      console.log(`Question: ${question.questionText.substring(0, 50)}...`);

      // 🔥 AI REFINEMENT
      let polishedContent;
      try {
        console.log(`📤 Sending to AI for refinement...`);
        polishedContent = await aiServiceInstance.refineExperience(rawData);
        console.log(`✅ AI refinement complete`);
      } catch (err) {
        console.log(`⚠️ AI unavailable (${err.message}), using raw data`);
        polishedContent = rawData;
      }

      // 🔥 DATA VALIDATION & NORMALIZATION
      if (polishedContent) {
        // Ensure keyMistakes is array
        if (typeof polishedContent.keyMistakes === 'string') {
          polishedContent.keyMistakes = polishedContent.keyMistakes
            .split(/[\n,;]/)
            .map(s => s.trim())
            .filter(Boolean);
        }
        if (!Array.isArray(polishedContent.keyMistakes)) {
          polishedContent.keyMistakes = [];
        }

        // Ensure actionableSteps is array of objects
        if (polishedContent.actionableSteps && typeof polishedContent.actionableSteps === 'string') {
          polishedContent.actionableSteps = polishedContent.actionableSteps
            .split(/[\n]/)
            .map((line, idx) => ({
              step: `Step ${idx + 1}`,
              description: line.trim()
            }))
            .filter(s => s.description);
        }
        if (!Array.isArray(polishedContent.actionableSteps)) {
          polishedContent.actionableSteps = [];
        }

        // Fallback for differentApproach
        if (!polishedContent.differentApproach && rawData.differentApproach) {
          polishedContent.differentApproach = rawData.differentApproach;
        }
      }

      // 🔥 GENERATE EMBEDDING FOR ANSWER CARD
      dlog(`🔢 Generating vector embedding for answer...`);
      const embeddingText = [
        polishedContent.situation,
        polishedContent.context,
        polishedContent.outcome,
        polishedContent.keyMistakes?.join(' '),
        polishedContent.actionableSteps?.map(s => s.description).join(' ')
      ].filter(Boolean).join(' ');

      const embedding = await getQuestionEmbedding(embeddingText);
      dlog(`✅ Embedding generated (${embedding?.length || 0} dims)`);

      // 🔥 CREATE ANSWER CARD
      const newCard = new AnswerCard({
        mentorId,
        questionId,
        mentorExperienceId,
        answerContent: polishedContent,
        embedding
      });

      await newCard.save();
      dlog(`✅ Answer Card created: ${newCard._id}`);

      // 🔥 UPDATE MENTOR STATS
      await User.findByIdAndUpdate(mentorId, {
        $inc: { 
          activeQuestions: -1,
          successfulMatches: 1
        }
      });
      dlog(`✅ Mentor stats updated (load -1, matches +1)`);

      dlog(`\n🎉 Answer Card transformation complete!`);
      return newCard;

    } catch (error) {
      console.error('🔥 Transform Error:', error);
      throw error;
    }
  }
  

}

export default new AtyantEngine();