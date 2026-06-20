import { useState, useEffect } from 'react';
import { Map as MapGL, MapArc, MapMarker, MarkerContent, MarkerLabel } from './ui/mapcn-map-arc';
import { API_URL } from '../services/api.js';

const HUB = { name: 'VNIT Nagpur', short: 'VNIT Nagpur', lng: 79.0530, lat: 21.1381 };

/**
 * Master college directory.
 * Each entry: { lng, lat, short, canonical }
 * - short     : map label (≤ 12 chars)
 * - canonical : display name used in hover card + deduplication key
 *
 * Keys are lowercase-normalised variants of how students actually type
 * the name in their profile (full names, abbreviations, with/without commas).
 * Multiple keys can share the same canonical so duplicates collapse.
 */
const COLLEGE_DIR = [
  // ── VNIT Nagpur ──────────────────────────────
  {
    canonical: 'VNIT Nagpur', short: 'VNIT Nagpur', lng: 79.0530, lat: 21.1381,
    aliases: ['vnit nagpur', 'visvesvaraya national institute of technology', 'nit nagpur',
              'visvesvaraya nit', 'vnit', 'visvesvaraya national institute of technology nagpur'],
  },
  // ── MANIT Bhopal ─────────────────────────────
  {
    canonical: 'MANIT Bhopal', short: 'MANIT', lng: 77.4098, lat: 23.2122,
    aliases: ['manit bhopal', 'maulana azad national institute of technology',
              'maulana azad national institute of technology bhopal', 'nit bhopal', 'manit'],
  },
  // ── NIT Raipur ───────────────────────────────
  {
    canonical: 'NIT Raipur', short: 'NIT Raipur', lng: 81.6045, lat: 21.2497,
    aliases: ['nit raipur', 'national institute of technology raipur',
              'national institute of technology  raipur'],
  },
  // ── NIT Warangal ─────────────────────────────
  {
    canonical: 'NIT Warangal', short: 'NIT WGL', lng: 79.5311, lat: 17.9805,
    aliases: ['nit warangal', 'national institute of technology warangal',
              'nitw', 'nit w'],
  },
  // ── NIT Calicut ──────────────────────────────
  {
    canonical: 'NIT Calicut', short: 'NIT CLT', lng: 75.9350, lat: 11.3223,
    aliases: ['nit calicut', 'national institute of technology calicut', 'nitc'],
  },
  // ── NIT Trichy ───────────────────────────────
  {
    canonical: 'NIT Trichy', short: 'NIT Trichy', lng: 78.8220, lat: 10.7605,
    aliases: ['nit trichy', 'nit tiruchirappalli', 'national institute of technology tiruchirappalli',
              'national institute of technology trichy', 'nitt'],
  },
  // ── NIT Kurukshetra ──────────────────────────
  {
    canonical: 'NIT Kurukshetra', short: 'NIT KKR', lng: 76.8195, lat: 29.9455,
    aliases: ['nit kurukshetra', 'national institute of technology kurukshetra', 'nitkkr'],
  },
  // ── NIT Silchar ──────────────────────────────
  {
    canonical: 'NIT Silchar', short: 'NIT SCL', lng: 92.7981, lat: 24.7348,
    aliases: ['nit silchar', 'national institute of technology silchar', 'nits'],
  },
  // ── MNIT Jaipur ──────────────────────────────
  {
    canonical: 'MNIT Jaipur', short: 'MNIT', lng: 75.8144, lat: 26.8926,
    aliases: ['nit jaipur', 'mnit jaipur', 'malaviya national institute of technology',
              'malaviya national institute of technology jaipur', 'mnit'],
  },
  // ── SVNIT Surat ──────────────────────────────
  {
    canonical: 'SVNIT Surat', short: 'SVNIT', lng: 72.8777, lat: 21.1520,
    aliases: ['nit surat', 'svnit surat', 'sardar vallabhbhai national institute of technology',
              'svnit'],
  },
  // ── MNNIT Allahabad ──────────────────────────
  {
    canonical: 'MNNIT Allahabad', short: 'MNNIT', lng: 81.8540, lat: 25.4358,
    aliases: ['nit allahabad', 'mnnit allahabad', 'motilal nehru national institute of technology',
              'motilal nehru national institute of technology allahabad', 'mnnit'],
  },
  // ── NIT Durgapur ─────────────────────────────
  {
    canonical: 'NIT Durgapur', short: 'NIT DGP', lng: 87.3119, lat: 23.5204,
    aliases: ['nit durgapur', 'national institute of technology durgapur', 'nitdgp'],
  },
  // ── NIT Hamirpur ─────────────────────────────
  {
    canonical: 'NIT Hamirpur', short: 'NIT HPR', lng: 76.5271, lat: 31.7050,
    aliases: ['nit hamirpur', 'national institute of technology hamirpur'],
  },
  // ── NIT Jalandhar ────────────────────────────
  {
    canonical: 'NIT Jalandhar', short: 'NIT JLD', lng: 75.5762, lat: 31.3926,
    aliases: ['nit jalandhar', 'dr b r ambedkar national institute of technology',
              'dr b r ambedkar national institute of technology jalandhar'],
  },
  // ── NIT Patna ────────────────────────────────
  {
    canonical: 'NIT Patna', short: 'NIT Patna', lng: 85.1376, lat: 25.6093,
    aliases: ['nit patna', 'national institute of technology patna', 'nitp'],
  },
  // ── NIT Rourkela ─────────────────────────────
  {
    canonical: 'NIT Rourkela', short: 'NIT RKL', lng: 84.9010, lat: 22.2604,
    aliases: ['nit rourkela', 'national institute of technology rourkela', 'nitr'],
  },
  // ── NITK Surathkal ───────────────────────────
  {
    canonical: 'NITK Surathkal', short: 'NITK', lng: 74.7932, lat: 13.0100,
    aliases: ['nit surathkal', 'nitk surathkal', 'nitk',
              'national institute of technology karnataka'],
  },
  // ── NIT Agartala ─────────────────────────────
  {
    canonical: 'NIT Agartala', short: 'NIT AGT', lng: 91.2868, lat: 23.8415,
    aliases: ['nit agartala', 'national institute of technology agartala'],
  },
  // ── NIT Goa ──────────────────────────────────
  {
    canonical: 'NIT Goa', short: 'NIT Goa', lng: 74.0125, lat: 15.4560,
    aliases: ['nit goa', 'national institute of technology goa'],
  },
  // ── NIT Manipur ──────────────────────────────
  {
    canonical: 'NIT Manipur', short: 'NIT MNP', lng: 93.9368, lat: 24.6637,
    aliases: ['nit manipur', 'national institute of technology manipur'],
  },
  // ── NIT Meghalaya ────────────────────────────
  {
    canonical: 'NIT Meghalaya', short: 'NIT MEG', lng: 91.8933, lat: 25.5746,
    aliases: ['nit meghalaya', 'national institute of technology meghalaya'],
  },
  // ── NIT Mizoram ──────────────────────────────
  {
    canonical: 'NIT Mizoram', short: 'NIT MZR', lng: 92.7176, lat: 23.7271,
    aliases: ['nit mizoram', 'national institute of technology mizoram'],
  },
  // ── NIT Sikkim ───────────────────────────────
  {
    canonical: 'NIT Sikkim', short: 'NIT SKM', lng: 88.6138, lat: 27.3314,
    aliases: ['nit sikkim', 'national institute of technology sikkim'],
  },
  // ── NIT Uttarakhand ──────────────────────────
  {
    canonical: 'NIT Uttarakhand', short: 'NIT UTK', lng: 78.7733, lat: 30.7333,
    aliases: ['nit uttarakhand', 'national institute of technology uttarakhand'],
  },
  // ── NIT Srinagar ─────────────────────────────
  {
    canonical: 'NIT Srinagar', short: 'NIT SRG', lng: 74.7972, lat: 34.0837,
    aliases: ['nit srinagar', 'national institute of technology srinagar'],
  },
  // ── IIT Bombay ───────────────────────────────
  {
    canonical: 'IIT Bombay', short: 'IIT-B', lng: 72.9159, lat: 19.1334,
    aliases: ['iit bombay', 'indian institute of technology bombay', 'iitb',
              'indian institute of technology  bombay'],
  },
  // ── IIT Delhi ────────────────────────────────
  {
    canonical: 'IIT Delhi', short: 'IIT-D', lng: 77.1925, lat: 28.5459,
    aliases: ['iit delhi', 'indian institute of technology delhi', 'iitd'],
  },
  // ── IIT Madras ───────────────────────────────
  {
    canonical: 'IIT Madras', short: 'IIT-M', lng: 80.2329, lat: 12.9916,
    aliases: ['iit madras', 'indian institute of technology madras', 'iitm'],
  },
  // ── IIT Kharagpur ────────────────────────────
  {
    canonical: 'IIT Kharagpur', short: 'IIT KGP', lng: 87.3199, lat: 22.3149,
    aliases: ['iit kharagpur', 'indian institute of technology kharagpur', 'iitkgp'],
  },
  // ── IIT Kanpur ───────────────────────────────
  {
    canonical: 'IIT Kanpur', short: 'IIT-K', lng: 80.2326, lat: 26.5123,
    aliases: ['iit kanpur', 'indian institute of technology kanpur', 'iitk'],
  },
  // ── IIT Roorkee ──────────────────────────────
  {
    canonical: 'IIT Roorkee', short: 'IIT-R', lng: 77.8963, lat: 29.8659,
    aliases: ['iit roorkee', 'indian institute of technology roorkee', 'iitr'],
  },
  // ── IIT Guwahati ─────────────────────────────
  {
    canonical: 'IIT Guwahati', short: 'IIT-G', lng: 91.6953, lat: 26.1926,
    aliases: ['iit guwahati', 'indian institute of technology guwahati', 'iitg'],
  },
  // ── IIT Hyderabad ────────────────────────────
  {
    canonical: 'IIT Hyderabad', short: 'IIT-H', lng: 78.1305, lat: 17.5936,
    aliases: ['iit hyderabad', 'indian institute of technology hyderabad', 'iith'],
  },
  // ── IIT Indore ───────────────────────────────
  {
    canonical: 'IIT Indore', short: 'IIT-I', lng: 75.9218, lat: 22.5200,
    aliases: ['iit indore', 'indian institute of technology indore', 'iiti'],
  },
  // ── IIT Jodhpur ──────────────────────────────
  {
    canonical: 'IIT Jodhpur', short: 'IIT-J', lng: 73.1160, lat: 26.2389,
    aliases: ['iit jodhpur', 'indian institute of technology jodhpur', 'iitj'],
  },
  // ── IIT Mandi ────────────────────────────────
  {
    canonical: 'IIT Mandi', short: 'IIT Mandi', lng: 76.9977, lat: 31.7753,
    aliases: ['iit mandi', 'indian institute of technology mandi'],
  },
  // ── IIT Patna ────────────────────────────────
  {
    canonical: 'IIT Patna', short: 'IIT Patna', lng: 85.0001, lat: 25.6143,
    aliases: ['iit patna', 'indian institute of technology patna', 'iitp'],
  },
  // ── IIT Gandhinagar ──────────────────────────
  {
    canonical: 'IIT Gandhinagar', short: 'IIT GN', lng: 72.6320, lat: 23.2156,
    aliases: ['iit gandhinagar', 'indian institute of technology gandhinagar', 'iitgn'],
  },
  // ── IIT Bhubaneswar ──────────────────────────
  {
    canonical: 'IIT Bhubaneswar', short: 'IIT BBS', lng: 85.6642, lat: 20.1485,
    aliases: ['iit bhubaneswar', 'indian institute of technology bhubaneswar', 'iitbbs'],
  },
  // ── IIT Jammu ────────────────────────────────
  {
    canonical: 'IIT Jammu', short: 'IIT Jammu', lng: 75.0141, lat: 32.7266,
    aliases: ['iit jammu', 'indian institute of technology jammu'],
  },
  // ── IIT Dharwad ──────────────────────────────
  {
    canonical: 'IIT Dharwad', short: 'IIT DWD', lng: 75.0078, lat: 15.4589,
    aliases: ['iit dharwad', 'indian institute of technology dharwad'],
  },
  // ── IIT Tirupati ─────────────────────────────
  {
    canonical: 'IIT Tirupati', short: 'IIT TPT', lng: 79.4916, lat: 13.6288,
    aliases: ['iit tirupati', 'indian institute of technology tirupati'],
  },
  // ── IIT Palakkad ─────────────────────────────
  {
    canonical: 'IIT Palakkad', short: 'IIT PKD', lng: 76.6413, lat: 10.7867,
    aliases: ['iit palakkad', 'indian institute of technology palakkad'],
  },
  // ── IIT Bhilai ───────────────────────────────
  {
    canonical: 'IIT Bhilai', short: 'IIT BHL', lng: 81.2803, lat: 21.2514,
    aliases: ['iit bhilai', 'indian institute of technology bhilai'],
  },
  // ── BITS Pilani ──────────────────────────────
  {
    canonical: 'BITS Pilani', short: 'BITS', lng: 73.3136, lat: 28.3638,
    aliases: ['bits pilani', 'birla institute of technology and science',
              'birla institute of technology and science pilani', 'bits'],
  },
  // ── BITS Goa ─────────────────────────────────
  {
    canonical: 'BITS Goa', short: 'BITS Goa', lng: 73.9234, lat: 15.3956,
    aliases: ['bits goa', 'birla institute of technology and science goa'],
  },
  // ── BITS Hyderabad ───────────────────────────
  {
    canonical: 'BITS Hyderabad', short: 'BITS HYD', lng: 78.3529, lat: 17.5449,
    aliases: ['bits hyderabad', 'birla institute of technology and science hyderabad'],
  },
  // ── COEP Pune ────────────────────────────────
  {
    canonical: 'COEP Pune', short: 'COEP', lng: 73.8567, lat: 18.5204,
    aliases: ['coep pune', 'college of engineering pune', 'coe pune', 'coep'],
  },
  // ── VIT Vellore ──────────────────────────────
  {
    canonical: 'VIT Vellore', short: 'VIT', lng: 79.1551, lat: 12.9691,
    aliases: ['vit vellore', 'vellore institute of technology', 'vit'],
  },
  // ── VIT Chennai ──────────────────────────────
  {
    canonical: 'VIT Chennai', short: 'VIT-C', lng: 80.2260, lat: 13.0099,
    aliases: ['vit chennai', 'vellore institute of technology chennai'],
  },
  // ── DTU Delhi ────────────────────────────────
  {
    canonical: 'DTU Delhi', short: 'DTU', lng: 77.1152, lat: 28.7502,
    aliases: ['dtu delhi', 'delhi technological university', 'dtu'],
  },
  // ── NSUT Delhi ───────────────────────────────
  {
    canonical: 'NSUT Delhi', short: 'NSUT', lng: 77.0379, lat: 28.6098,
    aliases: ['nsit delhi', 'nsut delhi', 'netaji subhas university of technology',
              'netaji subhas institute of technology'],
  },
  // ── PEC Chandigarh ───────────────────────────
  {
    canonical: 'PEC Chandigarh', short: 'PEC', lng: 76.7794, lat: 30.7580,
    aliases: ['pec chandigarh', 'punjab engineering college', 'pec university of technology'],
  },
  // ── Thapar University ────────────────────────
  {
    canonical: 'Thapar Patiala', short: 'Thapar', lng: 76.3607, lat: 30.3548,
    aliases: ['thapar university', 'thapar institute', 'thapar institute of engineering and technology'],
  },
  // ── Jadavpur University ──────────────────────
  {
    canonical: 'Jadavpur University', short: 'JU', lng: 88.3707, lat: 22.4990,
    aliases: ['jadavpur university', 'ju kolkata'],
  },
  // ── RVCE Bangalore ───────────────────────────
  {
    canonical: 'RVCE Bangalore', short: 'RVCE', lng: 77.4979, lat: 12.9237,
    aliases: ['rvce bangalore', 'r v college of engineering', 'rv college of engineering',
              'r.v. college of engineering'],
  },
  // ── MSRIT Bangalore ──────────────────────────
  {
    canonical: 'MSRIT Bangalore', short: 'MSRIT', lng: 77.5603, lat: 13.0072,
    aliases: ['msrit bangalore', 'm s ramaiah institute of technology', 'ms ramaiah'],
  },
  // ── BMSCE Bangalore ──────────────────────────
  {
    canonical: 'BMSCE Bangalore', short: 'BMSCE', lng: 77.5764, lat: 12.9242,
    aliases: ['bmsce bangalore', 'bms college of engineering'],
  },
  // ── SGSITS Indore ────────────────────────────
  {
    canonical: 'SGSITS Indore', short: 'SGSITS', lng: 75.8577, lat: 22.7196,
    aliases: ['sgsits indore', 'shri g s institute of technology and science'],
  },
  // ── IET DAVV Indore ──────────────────────────
  {
    canonical: 'IET DAVV Indore', short: 'DAVV', lng: 75.9063, lat: 22.6839,
    aliases: ['iet davv indore', 'davv indore', 'institute of engineering and technology davv'],
  },
  // ── SRM University ───────────────────────────
  {
    canonical: 'SRM University', short: 'SRM', lng: 80.0423, lat: 12.8231,
    aliases: ['srm university', 'srm institute of science and technology', 'srm kattankulathur'],
  },
  // ── Amity University ─────────────────────────
  {
    canonical: 'Amity Noida', short: 'Amity', lng: 77.3200, lat: 28.5441,
    aliases: ['amity university', 'amity university noida', 'amity noida'],
  },
  // ── Manipal University ───────────────────────
  {
    canonical: 'Manipal University', short: 'Manipal', lng: 74.7890, lat: 13.3519,
    aliases: ['manipal university', 'manipal institute of technology', 'mit manipal'],
  },
  // ── PSG Tech Coimbatore ──────────────────────
  {
    canonical: 'PSG Tech', short: 'PSG Tech', lng: 76.9898, lat: 11.0236,
    aliases: ['psg tech', 'psg college of technology'],
  },
];

/* ── Build lookup map from aliases ─────────────────────────────────────── */
const ALIAS_MAP = new Map();
for (const entry of COLLEGE_DIR) {
  for (const alias of entry.aliases) {
    ALIAS_MAP.set(alias, entry);
  }
}

function normalize(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')  // commas, dots, parens → space
    .replace(/\s+/g, ' ')
    .trim();
}

/** Returns the COLLEGE_DIR entry for a college name, or null */
function resolveEntry(name) {
  const key = normalize(name);
  if (ALIAS_MAP.has(key)) return ALIAS_MAP.get(key);

  // Partial: key contains an alias or an alias contains key
  for (const [alias, entry] of ALIAS_MAP) {
    if (key.includes(alias) || alias.includes(key)) return entry;
  }
  return null;
}

/* ── Fallback when backend is unreachable ──────────────────────────────── */
const FALLBACK_NAMES = [
  'MANIT Bhopal', 'NIT Raipur', 'NIT Warangal', 'NIT Calicut',
  'NIT Trichy', 'COEP Pune', 'NIT Kurukshetra', 'BITS Pilani',
  'VIT Vellore', 'NIT Silchar', 'IIT Bombay',
];

function buildFallback() {
  return FALLBACK_NAMES.flatMap((name) => {
    const entry = resolveEntry(name);
    if (!entry) return [];
    return [{ name: entry.canonical, short: entry.short, count: 0, lng: entry.lng, lat: entry.lat }];
  });
}

const STATS = [
  { value: '30+',    label: 'Colleges'          },
  { value: '500+',   label: 'Verified seniors'  },
  { value: '2,000+', label: 'Students clarified'},
  { value: '₹49',    label: 'Starting price'    },
];

export default function CollegeNetworkMap() {
  const [colleges, setColleges]             = useState([]);
  const [hoveredCollege, setHoveredCollege] = useState(null);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchColleges() {
      try {
        const res  = await fetch(`${API_URL}/api/stats/colleges`);
        if (!res.ok) throw new Error('non-2xx');
        const data = await res.json();

        if (cancelled) return;

        // Map each backend name to a canonical entry, deduplicate by canonical name
        const seen    = new Map();   // canonical → { ...entry, count }
        const hubNorm = normalize(HUB.name);

        for (const { name, count } of data.colleges || []) {
          const entry = resolveEntry(name);
          if (!entry) continue;
          // Skip hub college
          if (normalize(entry.canonical) === hubNorm) continue;

          if (seen.has(entry.canonical)) {
            seen.get(entry.canonical).count += count;
          } else {
            seen.set(entry.canonical, {
              name: entry.canonical,
              short: entry.short,
              count,
              lng: entry.lng,
              lat: entry.lat,
            });
          }
        }

        const mapped = Array.from(seen.values()).sort((a, b) => b.count - a.count);
        setColleges(mapped.length > 0 ? mapped : buildFallback());
      } catch {
        if (!cancelled) setColleges(buildFallback());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchColleges();
    return () => { cancelled = true; };
  }, []);

  const arcs = colleges.map((c) => ({
    id: c.name,
    from: [HUB.lng, HUB.lat],
    to:   [c.lng,   c.lat  ],
  }));

  const handleHover = (e) => {
    if (!e) { setHoveredCollege(null); return; }
    setHoveredCollege(colleges.find((c) => c.name === e.arc.id) ?? null);
  };

  return (
    <section className="college-network-section">
      <div className="college-network-header">
        <p className="al-eyebrow">Reach</p>
        <h2>
          Built in Nagpur.<br />
          <span className="al-h1-accent">Reaching India's Future Engineers.</span>
        </h2>
        <p className="college-network-desc">
          From NIT Trichy to IIT Jammu, BITS Pilani to NIT Silchar — Atyant connects
          students with verified seniors across {colleges.length > 1 ? `${colleges.length}+` : '30+'} engineering campuses.
        </p>
      </div>

      <div className="college-network-map-wrap">
        <div className="college-network-map-inner">
          <MapGL
            center={[82, 22]}
            zoom={4.0}
            theme="light"
            minZoom={3}
            maxZoom={10}
            dragRotate={false}
            pitchWithRotate={false}
            loading={loading}
          >
            {arcs.length > 0 && (
              <MapArc
                data={arcs}
                curvature={0.28}
                paint={{
                  'line-color':     '#7C3AED',
                  'line-width':     1.5,
                  'line-opacity':   0.55,
                  'line-dasharray': [3, 3],
                }}
                hoverPaint={{
                  'line-color':   '#7C3AED',
                  'line-width':   3,
                  'line-opacity': 1,
                }}
                onHover={handleHover}
              />
            )}

            {colleges.map((college) => {
              const isHovered = hoveredCollege?.name === college.name;
              return (
                <MapMarker key={college.name} longitude={college.lng} latitude={college.lat}>
                  <MarkerContent>
                    <div
                      className="college-marker-dot"
                      style={{
                        background: isHovered ? '#7C3AED' : '#3B82F6',
                        transform:  isHovered ? 'scale(1.4)' : 'scale(1)',
                      }}
                    />
                    <MarkerLabel position="top" className="college-marker-label">
                      {college.short}
                    </MarkerLabel>
                  </MarkerContent>
                </MapMarker>
              );
            })}

            {/* Hub — VNIT Nagpur */}
            <MapMarker longitude={HUB.lng} latitude={HUB.lat}>
              <MarkerContent>
                <div className="hub-marker-pulse" />
                <div className="hub-marker-dot" />
                <MarkerLabel position="top" className="hub-marker-label">
                  {HUB.name}
                </MarkerLabel>
              </MarkerContent>
            </MapMarker>
          </MapGL>

          {hoveredCollege && (
            <div className="college-hover-card">
              <div className="college-hover-name">{hoveredCollege.name}</div>
              <div className="college-hover-meta">
                {hoveredCollege.count > 0 && (
                  <span className="college-hover-badge">{hoveredCollege.count}+ students</span>
                )}
              </div>
            </div>
          )}

          <div className="college-map-legend">
            <div className="legend-item">
              <span className="legend-dot legend-dot-hub" />
              <span>Nagpur (Hub)</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot-college" />
              <span>Trusted Colleges</span>
            </div>
          </div>
        </div>

        <div className="college-network-stats">
          {STATS.map((s) => (
            <div key={s.label} className="college-stat">
              <div className="college-stat-value">{s.value}</div>
              <div className="college-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
