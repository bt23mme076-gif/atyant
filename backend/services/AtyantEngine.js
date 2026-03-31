import User from '../models/User.js';
import Question from '../models/Question.js';
import AnswerCard from '../models/AnswerCard.js';
import { sendMentorNewQuestionNotification } from '../utils/emailNotifications.js';
import { getQuestionEmbedding } from './AIService.js';
import aiServiceInstance from './AIService.js';
import crypto from 'crypto';
import { LRUCache } from 'lru-cache';

// ─────────────────────────────────────────────
//  DEV / DEBUG LOGGER
// ─────────────────────────────────────────────
// By default logs are shown in development. To enable detailed matching
// diagnostics in any environment, set DEBUG_MATCHING=1 (or 'true').
const isDev = process.env.NODE_ENV !== 'production';
const alwaysDebug = process.env.DEBUG_MATCHING === '1' || process.env.DEBUG_MATCHING === 'true';
function dlog(...args) { if (isDev || alwaysDebug) console.log(...args); }

// ─────────────────────────────────────────────
//  COMPANY CACHE  (TTL-based, O(1) lookup)
// ─────────────────────────────────────────────
let COMPANY_CACHE      = null;
let COMPANY_CACHE_TIME = 0;
const COMPANY_TTL      = 6 * 60 * 60 * 1000; // 6 h
const COMPANY_LOOKUP   = new Map();            // alias → canonical key

// ─────────────────────────────────────────────
//  MENTOR LIST CACHE  (🔴 FIX #4: was missing)
//  Saves a full DB scan on every Path-B request
// ─────────────────────────────────────────────
let MENTOR_CACHE      = null;
let MENTOR_CACHE_TIME = 0;
const MENTOR_TTL      = 5 * 60 * 1000; // 5 min

// ─────────────────────────────────────────────
//  VECTOR RESULT CACHE  (LRU, 10-min TTL)
// ─────────────────────────────────────────────
const VECTOR_CACHE = new LRUCache({
  max              : 1000,
  ttl              : 10 * 60 * 1000,
  updateAgeOnGet   : false,
  updateAgeOnHas   : false,
});

// ─────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────
const CONFIG = {
  // Vector search
  SEMANTIC_FLOOR       : 0.85,
  INSTANT_THRESHOLD    : 0.88,
  VECTOR_CANDIDATES    : 80,
  VECTOR_LIMIT         : 25,

  // Live routing
  LIVE_MATCH_THRESHOLD : 350,
  LOAD_PENALTY         : 60,
  MAX_LOAD             : 5,

  // Quality gates
  MIN_SCORE_GAP        : 0.04,
  AMBIGUITY_THRESHOLD  : 0.03,
  TOP_MATCH_CONFIDENCE : 0.92,

  // Retry
  MAX_RETRIES          : 2,

  // Hybrid scoring weights (vector path)
  WEIGHTS: {
    EXACT_COMPANY  : 0.12,
    RELATED_COMPANY: 0.06,
    EXACT_DOMAIN   : 0.08,
    PARTIAL_DOMAIN : 0.04,
    SPECIAL_TAG    : 0.05,
    MILESTONE      : 0.04,
    EXPERTISE      : 0.06,
    BIO_DENSITY    : 0.03,
    COLLEGE_TYPE   : 0.05,
    SAME_BRANCH    : 0.03,
    HIGH_RATING    : 0.05,
    HIGH_RESPONSE  : 0.04,
    RECENT_ACTIVE  : 0.03,
  },

  // Live routing points
  LIVE_WEIGHTS: {
    EXACT_COMPANY    : 700,
    RELATED_COMPANY  : 350,
    SPECIAL_TAG      : 500,
    EXACT_DOMAIN     : 300,
    PARTIAL_DOMAIN   : 150,
    MILESTONE        : 200,
    EXPERTISE_EXACT  : 250,
    EXPERTISE_PARTIAL: 125,
    BIO_KEYWORD      : 60,
    COLLEGE_TYPE     : 120,
    SAME_BRANCH      : 80,
    HIGH_RATING      : 120,
    HIGH_RESPONSE    : 100,
    RECENT_ACTIVE    : 70,
    PROVEN_MENTOR    : 150,
  },
};

// ─────────────────────────────────────────────
//  COMPANY ALIASES
//  🔴 FIX #5: all keys are now lowercase
// ─────────────────────────────────────────────
const COMPANY_ALIASES = {
  google       : ['google', 'alphabet', 'gcp', 'youtube'],
  microsoft    : ['microsoft', 'msft', 'azure', 'linkedin'],
  amazon       : ['amazon', 'aws', 'amzn', 'prime'],
  meta         : ['meta', 'facebook', 'fb', 'instagram', 'whatsapp', 'ig'],
  apple        : ['apple', 'aapl', 'iphone', 'mac'],
  netflix      : ['netflix', 'nflx'],
  nvidia       : ['nvidia', 'nvda'],
  tesla        : ['tesla', 'tsla'],
  jpmorgan     : ['jpmorgan', 'jp morgan', 'jpm', 'chase', 'jpmchase', 'j.p. morgan', 'jpmorgan chase'],
  goldmansachs : ['goldman sachs', 'goldman', 'gs'],
  morganstanley: ['morgan stanley', 'ms', 'morganstanley'],
  citadel      : ['citadel', 'citadel securities'],
  janestreet   : ['jane street', 'janestreet'],
  tower        : ['tower research', 'tower'],
  uber         : ['uber', 'uber technologies'],
  airbnb       : ['airbnb'],
  snowflake    : ['snowflake'],
  databricks   : ['databricks'],
  stripe       : ['stripe'],
  coinbase     : ['coinbase'],
  flipkart     : ['flipkart', 'walmart india'],
  swiggy       : ['swiggy'],
  zomato       : ['zomato'],
  paytm        : ['paytm', 'one97'],
  ola          : ['ola', 'ola electric', 'ola cabs'],
  cred         : ['cred'],
  razorpay     : ['razorpay'],
  phonepe      : ['phonepe'],
  atlassian    : ['atlassian', 'jira', 'confluence', 'trello'],
  adobe        : ['adobe', 'adbe'],
  salesforce   : ['salesforce', 'crm'],
  oracle       : ['oracle', 'orcl'],
  sap          : ['sap'],
  intuit       : ['intuit', 'quickbooks', 'turbotax'],
  servicenow   : ['servicenow', 'now'],
  cisco        : ['cisco', 'csco'],
  vmware       : ['vmware', 'broadcom'],
  redhat       : ['redhat', 'red hat', 'ibm'],
  qualcomm     : ['qualcomm', 'qcom'],
  intel        : ['intel', 'intc'],
  amd          : ['amd', 'advanced micro devices'],
  deshaw       : ['de shaw', 'deshaw', 'd.e. shaw', 'de shaw'],
  // 🔴 FIX #5: was 'McKinsey' (camelCase), never matched
  mckinsey     : ['mckinsey', 'mckinsey & company'],
  bcg          : ['bcg', 'boston consulting'],
  bain         : ['bain', 'bain & company'],
};

// ─────────────────────────────────────────────
//  TECH KEYWORDS
// ─────────────────────────────────────────────
const TECH_KEYWORDS = [
  'python','java','javascript','c++','cpp','golang','rust','kotlin',
  'swift','typescript','scala','ruby','php',
  'react','angular','vue','nextjs','django','flask','fastapi',
  'spring','springboot','nodejs','express','nestjs',
  'machine learning','ml','deep learning','dl','nlp','computer vision',
  'tensorflow','pytorch','keras','scikit','pandas','numpy',
  'aws','azure','gcp','docker','kubernetes','k8s','terraform',
  'jenkins','ci/cd','devops','ansible',
  'sql','mysql','postgresql','mongodb','redis','cassandra',
  'dynamodb','elasticsearch',
  'dsa','data structures','algorithms','system design','hld','lld',
  'oops','dbms','operating system','os','networks','computer networks',
  'backend','frontend','fullstack','mobile','android','ios',
  'data science','data engineering','sde','swe','devops engineer',
  'quant','quantitative','trading','fintech',
];

// ─────────────────────────────────────────────
//  SPECIAL TAGS
// ─────────────────────────────────────────────
const SPECIAL_TAGS = [
  'iit','nit','iiit','bits','iim','dtu','nsut','vit',
  'faang','maang','foreign','abroad','usa','europe','canada','germany',
  'startup','unicorn','series-a','early-stage',
  'on-campus','off-campus','ppo','pre-placement',
  'masters','ms','mtech','mba','phd','research',
  'gate','gre','gmat','cat','upsc',
  'consulting','product','quant','trading','fintech',
  'competitive programming','cp','hackathon','open source',
  'gsoc','leetcode','codeforces','kaggle',
  'career switch','domain switch','company switch',
];

// ─────────────────────────────────────────────
//  UTILITY FUNCTIONS
// ─────────────────────────────────────────────

/** Normalise a raw company string to its canonical alias key */
function normalizeCompany(company) {
  if (!company || typeof company !== 'string') return '';
  const clean = company.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '');
  for (const [key, aliases] of Object.entries(COMPANY_ALIASES)) {
    if (aliases.some(a => a.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '') === clean)) {
      return key;
    }
  }
  return clean;
}

function getCollegeType(collegeName) {
  if (!collegeName) return 'unknown';
  const n = collegeName.toLowerCase();
  if (n.includes('iit'))  return 'iit';
  if (n.includes('nit'))  return 'nit';
  if (n.includes('iiit')) return 'iiit';
  if (n.includes('bits')) return 'bits';
  if (n.includes('iim'))  return 'iim';
  const tier1 = ['dtu','nsut','vit','manipal','thapar','rvce','pec','coep','vnit'];
  if (tier1.some(t => n.includes(t))) return 'tier1';
  return 'tier2';
}

function extractSmartKeywords(text) {
  const stopwords = new Set([
    'the','is','at','which','on','a','an','as','are','was','were',
    'been','be','have','has','had','do','does','did','will','would',
    'should','could','may','might','must','can','to','of','in','for',
    'with','from','by','about','into','through','during','before',
    'after','above','below','between','under','again','further','then',
    'once','here','there','when','where','why','how','all','both',
    'each','few','more','most','other','some','such','only','own',
    'same','than','too','very','just','but','what','get','got','help',
    'want','need','know','like','kaise','kya','hai','hain','mujhe',
    'bhai','yaar','bro','plz','pls',
  ]);
  return [...new Set(
    text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopwords.has(w))
  )].slice(0, 25);
}

function isRecentlyActive(lastActive, days = 14) {
  if (!lastActive) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(lastActive) > cutoff;
}

// ─────────────────────────────────────────────
//  COMPANY CACHE LOADER
// ─────────────────────────────────────────────
async function getAllTargetCompanies() {
  try {
    const now = Date.now();
    if (COMPANY_CACHE && (now - COMPANY_CACHE_TIME) < COMPANY_TTL) {
      return COMPANY_CACHE;
    }

    const mentors = await User.find({ role: 'mentor' }).select('topCompanies').lean();
    const allCompanies = mentors.flatMap(m =>
      Array.isArray(m.topCompanies) ? m.topCompanies.filter(c => typeof c === 'string') : []
    );

    COMPANY_CACHE      = [...new Set(allCompanies.map(normalizeCompany))].filter(Boolean);
    COMPANY_CACHE_TIME = now;

    // Rebuild O(1) lookup map
    COMPANY_LOOKUP.clear();
    for (const c of COMPANY_CACHE) {
      const aliases = COMPANY_ALIASES[c] || [c];
      aliases.forEach(a => {
        COMPANY_LOOKUP.set(a.toLowerCase().replace(/[^a-z0-9]/g, ''), c);
      });
    }

    dlog(`✅ Company cache rebuilt (${COMPANY_CACHE.length} companies)`);
    return COMPANY_CACHE;
  } catch (err) {
    console.error('getAllTargetCompanies error:', err);
    return [];
  }
}

// ─────────────────────────────────────────────
//  MENTOR LIST CACHE LOADER  (🔴 FIX #4)
// ─────────────────────────────────────────────
async function getActiveMentors() {
  try {
    const now = Date.now();
    if (MENTOR_CACHE && (now - MENTOR_CACHE_TIME) < MENTOR_TTL) {
      dlog(`💾 Mentor cache hit (${MENTOR_CACHE.length} mentors)`);
      return MENTOR_CACHE;
    }

    const mentors = await User.find({
      role: 'mentor',
      $and: [
        {
          $or: [
            { activeQuestions: { $exists: false } },
            { activeQuestions: null },
            { activeQuestions: { $lt: CONFIG.MAX_LOAD + 2 } },
          ],
        },
        {
          $or: [
            { lastActive: { $exists: false } },
            { lastActive: null },
            { lastActive: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
          ],
        },
      ],
    })
      .select(
        'username email education primaryDomain topCompanies milestones specialTags ' +
        'expertise bio activeQuestions rating responseRate lastActive successfulMatches companyDomain'
      )
      .lean();

    MENTOR_CACHE      = mentors;
    MENTOR_CACHE_TIME = now;
    dlog(`✅ Mentor cache rebuilt (${mentors.length} mentors)`);
    return mentors;
  } catch (err) {
    console.error('getActiveMentors error:', err);
    return [];
  }
}

/** Invalidate mentor cache after any write that changes load/availability */
function invalidateMentorCache() {
  MENTOR_CACHE      = null;
  MENTOR_CACHE_TIME = 0;
}

// ─────────────────────────────────────────────
//  SLEEP HELPER  (for retry backoff)
// ─────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─────────────────────────────────────────────
//  MAIN ENGINE CLASS
// ─────────────────────────────────────────────
class AtyantEngine {

  /* =============================================
      🧠 DEEP QUERY ANALYSIS
     ============================================= */
  async detectQueryDetails(text) {
    const t = text.toLowerCase();

    // 1. Intent detection
    const internshipPatterns = [
      'internship','intern','summer internship','winter internship',
      'intern offer','internship offer','intern prep',
    ];
    const placementPatterns = [
      'placement','job','full time','full-time','ft role','ft offer',
      'job offer','campus placement','recruitment',
    ];

    const internMatches = internshipPatterns.filter(p => t.includes(p)).length;
    const placeMatches  = placementPatterns.filter(p => t.includes(p)).length;

    let intent, confidence;
    if (internMatches > placeMatches && internMatches > 0) {
      intent = 'internship'; confidence = Math.min(internMatches / internshipPatterns.length, 1);
    } else if (placeMatches > 0) {
      intent = 'placement'; confidence = Math.min(placeMatches / placementPatterns.length, 1);
    } else {
      intent = 'general'; confidence = 0.3;
    }

    // 2. Company detection — cache must already be warm
    const mentionedCompanies = [];
    const relatedCompanies   = [];

    const tClean  = t.replace(/[^a-z0-9\s]/g, '');
    const tokens  = tClean.split(/\s+/);
    const tokenSet = new Set(tokens);

    // Unigram lookup  O(n)
    for (const token of tokenSet) {
      const clean = token.replace(/[^a-z0-9]/g, '');
      if (COMPANY_LOOKUP.has(clean)) {
        const key = COMPANY_LOOKUP.get(clean);
        if (!mentionedCompanies.includes(key)) mentionedCompanies.push(key);
      }
    }

    // 🔴 FIX #6: bigram + trigram lookup for "jp morgan", "j.p. morgan", "morgan stanley" etc.
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram  = (tokens[i] + tokens[i + 1]).replace(/[^a-z0-9]/g, '');
      const trigram = i < tokens.length - 2
        ? (tokens[i] + tokens[i + 1] + tokens[i + 2]).replace(/[^a-z0-9]/g, '')
        : null;

      for (const gram of [bigram, trigram].filter(Boolean)) {
        if (COMPANY_LOOKUP.has(gram)) {
          const key = COMPANY_LOOKUP.get(gram);
          if (!mentionedCompanies.includes(key) && !relatedCompanies.includes(key)) {
            relatedCompanies.push(key);
          }
        }
      }
    }

    const foundTags    = SPECIAL_TAGS.filter(tag => t.includes(tag));
    const mentionedTech = TECH_KEYWORDS.filter(tech =>
      tech.includes(' ') ? t.includes(tech) : t.includes(tech)
    );

    return {
      intent,
      confidence,
      mentionedCompanies,
      relatedCompanies,
      foundTags,
      mentionedTech,
      isUrgent       : /urgent|asap|immediate|quickly|fast/.test(t),
      isDetailOriented: text.length > 200,
      hasSpecifics   : mentionedCompanies.length > 0 || mentionedTech.length > 2,
      questionLength : text.length,
    };
  }

  /* =============================================
      🔥 PATH A: VECTOR SEMANTIC MATCHING
     ============================================= */
  async findBestSemanticMatch(studentId, vector, questionText) {
    try {
      // Cache check
      const cacheKey = crypto.createHash('sha1').update(questionText).digest('hex');
      if (VECTOR_CACHE.has(cacheKey)) {
        dlog(`💾 VECTOR CACHE HIT`);
        return VECTOR_CACHE.get(cacheKey);
      }

      const student           = await User.findById(studentId).select('education').lean();
      const sEdu              = student?.education?.[0] || {};
      const studentCollegeType = getCollegeType(sEdu.institutionName);

      const queryDetails = await this.detectQueryDetails(questionText);
      const { intent, confidence, mentionedCompanies, relatedCompanies,
              foundTags, mentionedTech, isUrgent, hasSpecifics } = queryDetails;

      dlog(`\n🔎 ===== VECTOR SEMANTIC SEARCH =====`);
      dlog(`Intent: ${intent} (${(confidence*100).toFixed(0)}%) | Companies: [${mentionedCompanies}]`);
      dlog(`Tags: [${foundTags.slice(0,5)}] | Tech: [${mentionedTech.slice(0,5)}]`);

      // Check if any AnswerCards have embeddings
      const answerCardsWithEmbeddings = await AnswerCard.countDocuments({
        embedding: { $exists: true, $ne: null, $not: { $size: 0 } },
      });
      if (answerCardsWithEmbeddings === 0) {
        dlog(`❌ No AnswerCards with embeddings — vector search skipped`);
        return null;
      }

      const dynamicCandidates = isUrgent ? 120 : hasSpecifics ? 80 : 50;

      const candidates = await AnswerCard.aggregate([
        {
          $vectorSearch: {
            index       : 'vector_index',
            path        : 'embedding',
            queryVector : vector,
            numCandidates: dynamicCandidates,
            limit       : CONFIG.VECTOR_LIMIT,
            filter      : {},
          },
        },
        {
          $project: {
            answerContent: 1,
            mentorId     : 1,
            questionId   : 1,
            createdAt    : 1,
            score        : { $meta: 'vectorSearchScore' },
          },
        },
      ]);

      dlog(`Atlas returned ${candidates.length} candidates`);
      if (candidates.length === 0) return null;

      // Bulk-fetch mentor data
      const mentorIds = [...new Set(candidates.map(c => c.mentorId.toString()))];
      const mentors   = await User.find({ _id: { $in: mentorIds }, role: 'mentor' })
        .select('username avatar bio education primaryDomain topCompanies milestones ' +
                'specialTags expertise rating responseRate lastActive successfulMatches companyDomain')
        .lean();
      const mentorMap = new Map(mentors.map(m => [m._id.toString(), m]));

      // Hybrid scoring
      const keywords = extractSmartKeywords(questionText);

      // Detect intent/categories early so live routing uses inferred intent
      // (prevents incorrect external category from giving huge ExactDomain bonuses)
      const queryDetailsForRouting = await this.detectQueryDetails(questionText);
      const inferredCategory = queryDetailsForRouting?.intent || null;
      const scoredMatches = [];
      const W = CONFIG.WEIGHTS;

      for (const match of candidates) {
        if (match.score < CONFIG.SEMANTIC_FLOOR) continue;
        const mentor = mentorMap.get(match.mentorId.toString());
        if (!mentor) continue;

        let totalBonus = 0;
        const bonusLogs = [];

        const mentorCompanies  = (mentor.topCompanies || []).map(normalizeCompany);
        const exactCo  = mentorCompanies.filter(mc => mentionedCompanies.includes(mc)).length;
        const relatedCo = mentorCompanies.filter(mc => relatedCompanies.includes(mc)).length;

        if (exactCo > 0)  { const b = W.EXACT_COMPANY * Math.min(exactCo, 3);   totalBonus += b; bonusLogs.push(`ExactCo(+${(b*100).toFixed(1)}%)`); }
        else if (relatedCo > 0) { const b = W.RELATED_COMPANY * Math.min(relatedCo, 2); totalBonus += b; bonusLogs.push(`RelatedCo(+${(b*100).toFixed(1)}%)`); }

        if (mentor.primaryDomain === intent) {
          const b = W.EXACT_DOMAIN * confidence; totalBonus += b; bonusLogs.push(`Domain(+${(b*100).toFixed(1)}%)`);
        } else if (mentor.primaryDomain === 'both') {
          const b = W.PARTIAL_DOMAIN * confidence; totalBonus += b; bonusLogs.push(`BothDomain(+${(b*100).toFixed(1)}%)`);
        }

        const tagCount = (mentor.specialTags || []).filter(tag => foundTags.some(ft => tag.toLowerCase().includes(ft))).length;
        if (tagCount > 0) { const b = W.SPECIAL_TAG * Math.min(tagCount, 4); totalBonus += b; bonusLogs.push(`Tags(+${(b*100).toFixed(1)}%,${tagCount}x)`); }

        const milestoneCount = (mentor.milestones || []).filter(m => foundTags.some(ft => m.toLowerCase().includes(ft))).length;
        if (milestoneCount > 0) { const b = W.MILESTONE * Math.min(milestoneCount, 3); totalBonus += b; bonusLogs.push(`Milestones(+${(b*100).toFixed(1)}%)`); }

        const expertiseMatches = (mentor.expertise || []).filter(exp => mentionedTech.some(t => exp.toLowerCase().includes(t))).length;
        if (expertiseMatches > 0) { const b = W.EXPERTISE * Math.min(expertiseMatches, 5); totalBonus += b; bonusLogs.push(`Tech(+${(b*100).toFixed(1)}%,${expertiseMatches}x)`); }

        const bioMatches = keywords.filter(kw => mentor.bio?.toLowerCase().includes(kw)).length;
        if (bioMatches >= 5) { totalBonus += W.BIO_DENSITY; bonusLogs.push(`Bio(+${(W.BIO_DENSITY*100).toFixed(1)}%)`); }

        const mEdu = mentor.education?.[0] || {};
        const mentorCollegeType = getCollegeType(mEdu.institutionName);
        if (studentCollegeType === mentorCollegeType && studentCollegeType !== 'unknown') {
          totalBonus += W.COLLEGE_TYPE; bonusLogs.push(`${studentCollegeType.toUpperCase()}(+${(W.COLLEGE_TYPE*100).toFixed(1)}%)`);
        }
        if (sEdu.field && mEdu.field && sEdu.field.toLowerCase() === mEdu.field.toLowerCase()) {
          totalBonus += W.SAME_BRANCH; bonusLogs.push(`Branch(+${(W.SAME_BRANCH*100).toFixed(1)}%)`);
        }
        if (mentor.rating >= 4.5)       { totalBonus += W.HIGH_RATING;    bonusLogs.push(`★${mentor.rating}(+${(W.HIGH_RATING*100).toFixed(1)}%)`); }
        if (mentor.responseRate >= 85)   { totalBonus += W.HIGH_RESPONSE;  bonusLogs.push(`Response(+${(W.HIGH_RESPONSE*100).toFixed(1)}%)`); }
        if (isRecentlyActive(mentor.lastActive)) { totalBonus += W.RECENT_ACTIVE; bonusLogs.push(`Active(+${(W.RECENT_ACTIVE*100).toFixed(1)}%)`); }
        if ((mentor.successfulMatches || 0) < 5) { totalBonus += 0.03; bonusLogs.push(`ColdStart(+3%)`); }

        const cappedBonus  = Math.min(totalBonus, 0.35);
        const finalScore   = Math.min(match.score * (1 + cappedBonus), 1.0);

        scoredMatches.push({
          ...match,
          finalScore,
          baseScore  : match.score,
          bonusScore : totalBonus,
          mentorProfile: {
            _id          : mentor._id,
            username     : mentor.username,
            avatar       : mentor.avatar,
            bio          : mentor.bio,
            education    : mEdu,
            rating       : mentor.rating,
            responseRate : mentor.responseRate,
            topCompanies : mentor.topCompanies,
          },
          breakdown: bonusLogs.join(' | '),
        });
      }

      scoredMatches.sort((a, b) => b.finalScore - a.finalScore);

      dlog(`\n--- TOP 5 VECTOR MATCHES ---`);
      scoredMatches.slice(0, 5).forEach((m, i) => {
        dlog(`#${i+1}: ${m.mentorProfile.username} | ${(m.finalScore*100).toFixed(2)}% (base ${(m.baseScore*100).toFixed(1)}% +${(m.bonusScore*100).toFixed(1)}%)\n   └─ ${m.breakdown || 'pure semantic'}`);
      });

      const best   = scoredMatches[0];
      const second = scoredMatches[1];

      if (!best || best.finalScore < CONFIG.INSTANT_THRESHOLD) {
        dlog(`⚠️ Below threshold (${((best?.finalScore||0)*100).toFixed(2)}% < ${CONFIG.INSTANT_THRESHOLD*100}%)`);
        return null;
      }

      if (second) {
        const gap = best.finalScore - second.finalScore;
        if (best.finalScore >= CONFIG.TOP_MATCH_CONFIDENCE) {
          dlog(`✅ EXCELLENT MATCH: ${best.mentorProfile.username} (${(best.finalScore*100).toFixed(2)}%)`);
        } else if (gap < CONFIG.AMBIGUITY_THRESHOLD) {
          dlog(`⚠️ AMBIGUOUS — gap ${(gap*100).toFixed(2)}% < ${CONFIG.AMBIGUITY_THRESHOLD*100}% — routing live`);
          return null;
        }
      }

      dlog(`✅ INSTANT MATCH: ${best.mentorProfile.username} ${(best.finalScore*100).toFixed(2)}%`);
      VECTOR_CACHE.set(cacheKey, best);
      return best;

    } catch (error) {
      console.error('🔥 Vector Search Error:', error);
      return null;
    }
  }

  /* =============================================
      🔥 PATH B: LIVE MENTOR ROUTING
     ============================================= */
  async findBestMentor(studentId, keywords, questionCategory = null) {
    try {
      const questionText = keywords.join(' ');
      const student      = await User.findById(studentId).select('education').lean();
      const sEdu         = student?.education?.[0] || {};
      const studentCollegeType = getCollegeType(sEdu.institutionName);

      const queryDetails = await this.detectQueryDetails(questionText);
      const { intent, confidence, mentionedCompanies, relatedCompanies, foundTags, mentionedTech } = queryDetails;

      dlog(`\n🤝 ===== LIVE MENTOR ROUTING =====`);

      // 🔴 FIX #4: Use cached mentor list instead of fresh DB scan
      const mentors = await getActiveMentors();
      dlog(`Scoring ${mentors.length} mentors...`);

      const LW = CONFIG.LIVE_WEIGHTS;

      const scored = mentors.map(mentor => {
        let points = 0;
        const breakdown = [];

        // Company domain match
        if (questionCategory && mentor.companyDomain === questionCategory) {
          points += 800; breakdown.push(`ExactDomain(+800)`);
        }

        // Company matching
        const mentorCompanies = (mentor.topCompanies || []).map(normalizeCompany);
        const exactCount      = mentorCompanies.filter(mc => mentionedCompanies.includes(mc)).length;
        const relatedCount    = mentorCompanies.filter(mc => relatedCompanies.includes(mc)).length;

        if (exactCount > 0)       { const p = LW.EXACT_COMPANY * exactCount;   points += p; breakdown.push(`ExactCo(+${p})`); }
        else if (relatedCount > 0){ const p = LW.RELATED_COMPANY * relatedCount; points += p; breakdown.push(`RelatedCo(+${p})`); }

        // Special tags
        const tagCount = (mentor.specialTags || []).filter(tag => foundTags.some(ft => tag.toLowerCase().includes(ft))).length;
        if (tagCount > 0) { const p = LW.SPECIAL_TAG * tagCount; points += p; breakdown.push(`Tags(+${p},${tagCount}x)`); }

        // Domain intent
        if (intent && intent !== 'general') {
          if (mentor.primaryDomain === intent) {
            const p = Math.round(LW.EXACT_DOMAIN * confidence); points += p; breakdown.push(`Domain(+${p})`);
          } else if (mentor.primaryDomain === 'both') {
            const p = Math.round(LW.PARTIAL_DOMAIN * confidence); points += p; breakdown.push(`BothDomain(+${p})`);
          }
        }

        // Milestones
        const milestoneCount = (mentor.milestones || []).filter(m => foundTags.some(ft => m.toLowerCase().includes(ft))).length;
        if (milestoneCount > 0) { const p = LW.MILESTONE * milestoneCount; points += p; breakdown.push(`Milestones(+${p})`); }

        // Expertise
        const expExact   = (mentor.expertise || []).filter(exp => mentionedTech.some(t => exp.toLowerCase() === t.toLowerCase())).length;
        const expPartial = (mentor.expertise || []).filter(exp => mentionedTech.some(t => exp.toLowerCase().includes(t))).length - expExact;
        if (expExact   > 0) { const p = LW.EXPERTISE_EXACT * expExact;     points += p; breakdown.push(`ExactTech(+${p})`); }
        if (expPartial > 0) { const p = LW.EXPERTISE_PARTIAL * expPartial; points += p; breakdown.push(`PartialTech(+${p})`); }

        // Bio keywords
        const bioCount = keywords.filter(kw => mentor.bio?.toLowerCase().includes(kw)).length;
        if (bioCount >= 3) { const p = LW.BIO_KEYWORD * bioCount; points += p; breakdown.push(`Bio(+${p})`); }

        // College type
        const mEdu = mentor.education?.[0] || {};
        const mentorCollegeType = getCollegeType(mEdu.institutionName);
        if (studentCollegeType === mentorCollegeType && studentCollegeType !== 'unknown') {
          points += LW.COLLEGE_TYPE; breakdown.push(`${studentCollegeType.toUpperCase()}(+${LW.COLLEGE_TYPE})`);
        }

        // Same branch
        if (sEdu.field && mEdu.field && sEdu.field.toLowerCase() === mEdu.field.toLowerCase()) {
          points += LW.SAME_BRANCH; breakdown.push(`Branch(+${LW.SAME_BRANCH})`);
        }

        // Quality signals
        if (mentor.rating >= 4.5)                  { points += LW.HIGH_RATING;   breakdown.push(`★${mentor.rating}(+${LW.HIGH_RATING})`); }
        if (mentor.responseRate >= 85)              { points += LW.HIGH_RESPONSE; breakdown.push(`Response(+${LW.HIGH_RESPONSE})`); }
        if (isRecentlyActive(mentor.lastActive))    { points += LW.RECENT_ACTIVE; breakdown.push(`Active(+${LW.RECENT_ACTIVE})`); }

        // Proven track record
        if ((mentor.successfulMatches || 0) >= 10) {
          const bonus = Math.min(Math.floor(mentor.successfulMatches / 10), 5) * LW.PROVEN_MENTOR;
          points += bonus; breakdown.push(`Proven(+${bonus})`);
        }

        // Load penalty
        const load = mentor.activeQuestions || 0;
        if (load >= CONFIG.MAX_LOAD) {
          const oldPoints = points;
          points = Math.floor(points * 0.25);
          breakdown.push(`OVERLOADED(-${oldPoints - points},${load}Q)`);
        } else if (load > 0) {
          const penalty = load * CONFIG.LOAD_PENALTY;
          points -= penalty;
          breakdown.push(`Load(-${penalty},${load}Q)`);
        }

        return { mentor, points, logs: breakdown.join(' | '), load };
      });

      scored.sort((a, b) => b.points - a.points);

      // Always print a concise TOP-5 summary so it's visible in terminals
      console.log('\n--- TOP 5 LIVE CANDIDATES ---');
      scored.slice(0, 5).forEach((item, i) => {
        console.log(`#${i+1}: ${item.mentor.username} | ${item.points}pts (${item.load}Q)`);
        dlog('   └─', item.logs || 'generic');
      });

      const best   = scored[0];
      const second = scored[1];

      // Always print detailed breakdown for the top candidate so it's
      // visible in terminal even when DEBUG_MATCHING is not enabled.
      if (best) {
        console.log('\n--- TOP CANDIDATE DETAILS ---');
        console.log(`${best.mentor.username} | ${best.points}pts (${best.load}Q)`);
        console.log('Breakdown:', best.logs || 'none');
      }

      if (!best || best.points < CONFIG.LIVE_MATCH_THRESHOLD) {
        console.log(`❌ NO QUALIFYING MENTOR: best=${best?.points || 0} < ${CONFIG.LIVE_MATCH_THRESHOLD}`);
        return null;
      }

      // Avoid overloaded if alternatives exist
      if (best.load >= CONFIG.MAX_LOAD) {
        const alt = scored.find(s => s.load < CONFIG.MAX_LOAD && s.points >= CONFIG.LIVE_MATCH_THRESHOLD);
        if (alt) {
          dlog(`⚠️ Best overloaded → switching to ${alt.mentor.username} (${alt.points}pts)`);
          return alt.mentor;
        }
      }

      // Tiebreaker (< 20% gap and both < 1000pts)
      if (second && (best.points - second.points) / best.points < 0.20 && best.points < 1000) {
        const gap = ((best.points - second.points) / best.points * 100).toFixed(1);
        dlog(`⚠️ CLOSE MATCH (${gap}% gap) — running tiebreakers`);
        if (second.mentor.rating > best.mentor.rating)                                           return second.mentor;
        if (second.load < best.load)                                                              return second.mentor;
        if ((second.mentor.successfulMatches || 0) > (best.mentor.successfulMatches || 0))       return second.mentor;
      }

      dlog(`✅ MENTOR ASSIGNED: ${best.mentor.username} | ${best.points}pts`);
      return best.mentor;

    } catch (error) {
      console.error('🔥 Live Routing Error:', error);
      return null;
    }
  }

  /* =============================================
      🚀 MAIN ORCHESTRATOR
     ============================================= */
  async processQuestion(userId, questionText, options = {}) {
    const retryCount = options._retryCount || 0;

    try {
      // Warm caches once (both company + mentor)
      await Promise.all([
        getAllTargetCompanies(),
        getActiveMentors(),
      ]);

      dlog(`\n🚀 ========== ATYANT ENGINE START ==========`);
      dlog(`User: ${userId} | Q(${questionText.length}ch): "${questionText.substring(0, 100)}..."`);

      // Generate embedding
      let vector = null;
      try {
        vector = await getQuestionEmbedding(questionText);
        dlog(`✅ Embedding (${vector?.length || 0} dims)`);
      } catch (err) {
        dlog(`❌ Embedding failed: ${err.message}`);
      }

      const keywords = extractSmartKeywords(questionText);

      // ──────────────────────────────────────────
      //  PATH A: Vector semantic search
      // ──────────────────────────────────────────
      if (vector && !options.isFollowUp) {
        dlog(`\n🎯 Path A: Vector search...`);
        const match = await this.findBestSemanticMatch(userId, vector, questionText);

        if (match) {
          const q = new Question({
            userId,
            questionText,
            keywords,
            status          : 'answered_instantly',
            answerCardId    : match._id,
            selectedMentorId: match.mentorProfile._id,
            isInstant       : true,
            matchScore      : Math.round(match.finalScore * 100),
            matchMethod     : 'vector_semantic',
          });
          await q.save();

          dlog(`🎉 INSTANT ANSWER | Card: ${match._id} | Mentor: ${match.mentorProfile.username} | ${(match.finalScore*100).toFixed(2)}%`);

          return {
            success      : true,
            instantAnswer: true,
            questionId   : q._id,
            answerCardId : match._id,
            answerContent: match.answerContent,
            mentor       : match.mentorProfile,
            matchScore   : match.finalScore,
            matchMethod  : 'vector_semantic',
          };
        }
        dlog(`Path A: no match — proceeding to Path B`);
      }

      // ──────────────────────────────────────────
      //  PATH B: Live mentor routing
      // ──────────────────────────────────────────
      dlog(`\n🎯 Path B: Live routing (inferred category: ${inferredCategory})...`);
      const bestMentor = await this.findBestMentor(userId, keywords, options.category || inferredCategory || null);

      const question = new Question({
        userId,
        questionText,
        keywords,
        status     : bestMentor ? 'mentor_assigned' : 'pending',
        matchMethod: 'live_routing',
        isFollowUp : options.isFollowUp || false,
      });

      if (bestMentor) {
        question.selectedMentorId = bestMentor._id;
        await question.save();

        // Atomic load increment — prevents race condition
        const updated = await User.findOneAndUpdate(
          { _id: bestMentor._id, activeQuestions: { $lt: CONFIG.MAX_LOAD } },
          { $inc: { activeQuestions: 1 } },
          { new: true }
        );

        if (!updated) {
          // 🔴 FIX #3: bounded retry with exponential backoff
          if (retryCount >= CONFIG.MAX_RETRIES) {
            console.error(`❌ Max retries (${CONFIG.MAX_RETRIES}) hit — moving to global pool`);
            // Invalidate mentor cache so next request gets fresh data
            invalidateMentorCache();
            question.status           = 'pending';
            question.selectedMentorId = undefined;
            await question.save();
            return {
              success    : true,
              message    : 'System is busy. Your question will be answered shortly.',
              questionId : question._id,
              pool       : 'global',
              matchMethod: 'retry_exhausted',
            };
          }
          console.warn(`⚠️ Mentor ${bestMentor.username} overloaded — retry ${retryCount + 1}/${CONFIG.MAX_RETRIES}`);
          invalidateMentorCache();
          await sleep(200 * Math.pow(2, retryCount)); // 200ms, 400ms backoff
          return this.processQuestion(userId, questionText, { ...options, _retryCount: retryCount + 1 });
        }

        // Invalidate mentor cache (load changed)
        invalidateMentorCache();

        // 🔴 FIX: Email failure is non-blocking but logged with context
        sendMentorNewQuestionNotification(bestMentor.email, bestMentor.username, questionText)
          .then(() => dlog(`📧 Email sent → ${bestMentor.username}`))
          .catch(err => console.error(`⚠️ Email failed for ${bestMentor.username}:`, err.message));

        dlog(`✅ ROUTED → ${bestMentor.username} | Load: ${updated.activeQuestions}`);

        return {
          success        : true,
          questionId     : question._id,
          message        : `Matching with ${bestMentor.username}...`,
          mentorId       : bestMentor._id,
          mentorUsername : bestMentor.username,
          matchMethod    : 'live_routing',
        };
      }

      // ──────────────────────────────────────────
      //  FALLBACK: Atyant Engine user
      // ──────────────────────────────────────────
      const engineUser = await User.findOne({ username: 'Atyant Engine', email: 'atyant.in@gmail.com' }).lean();
      if (engineUser) {
        question.selectedMentorId = engineUser._id;
        question.status           = 'mentor_assigned';
        await question.save();
        dlog(`⚠️ Assigned to Atyant Engine user`);
        return {
          success        : true,
          questionId     : question._id,
          message        : 'Connecting to Atyant Engine...',
          mentorId       : engineUser._id,
          mentorUsername : engineUser.username,
          matchMethod    : 'atyant_engine_fallback',
        };
      }

      // ──────────────────────────────────────────
      //  GLOBAL POOL
      // ──────────────────────────────────────────
      await question.save();
      dlog(`⚠️ GLOBAL POOL — no mentor met threshold`);
      return {
        success    : true,
        message    : 'Looking for a senior mentor...',
        questionId : question._id,
        pool       : 'global',
        matchMethod: 'pending_assignment',
      };

    } catch (error) {
      console.error('\n🔥 ENGINE CRITICAL ERROR\n', error);
      return { success: false, message: 'Failed to submit question. Please try again.' };
    }
  }

  /* =============================================
      🔄 ANSWER CARD TRANSFORMATION
     ============================================= */
  async transformToAnswerCard(mentorExperience, question) {
    try {
      const { mentorId, _id: mentorExperienceId, rawExperience: rawData } = mentorExperience;
      const questionId = question._id;

      console.log(`\n✨ Transforming → AnswerCard for: "${question.questionText.substring(0, 60)}..."`);

      // AI refinement
      let polishedContent;
      try {
        polishedContent = await aiServiceInstance.refineExperience(rawData);
        console.log(`✅ AI refinement complete`);
      } catch (err) {
        console.warn(`⚠️ AI unavailable (${err.message}) — using raw data`);
        polishedContent = rawData;
      }

      // Data normalisation
      if (polishedContent) {
        if (typeof polishedContent.keyMistakes === 'string') {
          polishedContent.keyMistakes = polishedContent.keyMistakes.split(/[\n,;]/).map(s => s.trim()).filter(Boolean);
        }
        if (!Array.isArray(polishedContent.keyMistakes)) polishedContent.keyMistakes = [];

        if (polishedContent.actionableSteps && typeof polishedContent.actionableSteps === 'string') {
          polishedContent.actionableSteps = polishedContent.actionableSteps
            .split(/\n/)
            .map((line, idx) => ({ step: `Step ${idx + 1}`, description: line.trim() }))
            .filter(s => s.description);
        }
        if (!Array.isArray(polishedContent.actionableSteps)) polishedContent.actionableSteps = [];

        if (!polishedContent.differentApproach && rawData?.differentApproach) {
          polishedContent.differentApproach = rawData.differentApproach;
        }
      }

      // 🔴 FIX #8: embedding failure is caught — card still saves, just not searchable
      let embedding = null;
      try {
        const embeddingText = [
          polishedContent?.situation,
          polishedContent?.context,
          polishedContent?.outcome,
          Array.isArray(polishedContent?.keyMistakes) ? polishedContent.keyMistakes.join(' ') : '',
          Array.isArray(polishedContent?.actionableSteps) ? polishedContent.actionableSteps.map(s => s.description).join(' ') : '',
        ].filter(Boolean).join(' ');

        embedding = await getQuestionEmbedding(embeddingText);
        dlog(`✅ Embedding generated (${embedding?.length || 0} dims)`);
      } catch (embErr) {
        console.error(`⚠️ Embedding failed — card will save but won't appear in vector search:`, embErr.message);
        // embedding stays null; card is still useful for live routing
      }

      const newCard = new AnswerCard({
        mentorId,
        questionId,
        mentorExperienceId,
        answerContent: polishedContent,
        ...(embedding ? { embedding } : {}),  // only set if we got one
      });
      await newCard.save();
      dlog(`✅ AnswerCard saved: ${newCard._id}${!embedding ? ' (no embedding)' : ''}`);

      // Update mentor stats + invalidate mentor cache
      await User.findByIdAndUpdate(mentorId, {
        $inc: { activeQuestions: -1, successfulMatches: 1 },
      });
      invalidateMentorCache();
      dlog(`✅ Mentor stats updated`);

      return newCard;
    } catch (error) {
      console.error('🔥 Transform Error:', error);
      throw error;
    }
  }

  /** Expose keyword extractor to routes */
  extractBetterKeywords(text) {
    try   { return extractSmartKeywords(text || ''); }
    catch { return []; }
  }

  /** Manually bust all runtime caches (admin use) */
  flushAllCaches() {
    COMPANY_CACHE      = null;
    COMPANY_CACHE_TIME = 0;
    invalidateMentorCache();
    VECTOR_CACHE.clear();
    console.log('🗑️  All AtyantEngine caches flushed');
  }
}

export default new AtyantEngine();