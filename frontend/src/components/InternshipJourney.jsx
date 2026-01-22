import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, Lock, Rocket, Target, ShieldCheck, 
  Search, FileText, Mail, ChevronRight, ChevronLeft, Activity, Info, AlertTriangle
} from 'lucide-react';
import './InternshipJourney.css';

// Optimized variants for a smooth horizontal slide
const variants = {
  enter: (direction) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 100 : -100, opacity: 0 })
};

// --- SUB-COMPONENTS (Memoized to stop typing lag) ---

const HeroStep = React.memo(({ onNext }) => (
  <motion.div className="step-container" variants={variants} custom={1} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}>
    <div className="badge">Quality-First Protocol</div>
    <h1 className="ultra-title">Internships don't fail because of <span className="gradient-text">effort.</span><br/>They fail because of <span className="gradient-text-red">execution.</span></h1>
    <p className="ultra-subtitle">Professor inboxes are graveyards of generic emails. Atyant is the filter that ensures your profile is respected, not just seen.</p>
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
      <button className="glow-button" style={{ background: '#222', color: '#f43f5e', border: '1px solid #f43f5e' }} onClick={() => window.open('https://forms.gle/qzBr4YNpVavv52cB9', '_blank')}>Get Free Resume Review</button>
      <button className="glow-button" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }}>
        <Lock size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
        Start Readiness Scan <Search size={20} />
      </button>
    </div>
  </motion.div>
));

const AssessmentStep = React.memo(({ data, updateData, onBack, isAnalyzing, handleScan }) => {
  // RESTORED: Your deep classification and fail logic
  const diagnostic = useMemo(() => {
    const intentClassify = (ans) => {
      if (!ans) return { level: 'weak', reason: 'No answer' };
      if (/exposure|learn|learning|experience/i.test(ans)) return { level: 'weak', reason: 'Focused on learning, not contribution' };
      if (ans.length > 0 && ans.length < 40) return { level: 'semi', reason: 'Somewhat clear, but not specific' };
      return { level: 'strong', reason: 'Specific & aligned' };
    };

    const intent = intentClassify(data.intent);
    const contribChecked = data.contrib ? data.contrib.filter(Boolean).length : 0;
    const outreachLevel = data.outreach >= 8 ? 'fail' : data.outreach >= 4 ? 'warn' : 'ok';
    const outreachMsg = data.outreach >= 8 ? 'Bulk outreach detected. High spam risk.' : data.outreach >= 4 ? 'Borderline mass outreach.' : 'Disciplined outreach.';
    
    let failCount = 0;
    if (intent.level === 'weak') failCount++;
    if (contribChecked < 2) failCount++;
    if (outreachLevel === 'fail') failCount++;
    if (Number(data.researchLevel || 0) < 2) failCount++;
    if (Number(data.hours || 0) < 25) failCount++;
    if (['giveup', 'moreprofs'].includes(data.coachability)) failCount++;

    return { intent, contribChecked, outreachLevel, outreachMsg, applyLocked: failCount >= 2 };
  }, [data]);

  return (
    <motion.div className="step-container scrollable-step" variants={variants} custom={1} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}>
      <button className="back-link" onClick={onBack}><ChevronLeft size={16}/> Back to Intro</button>
      <h2 className="section-title">Profile Deep-Scan</h2>
      <p className="instruction">We don’t reject students. We expose readiness gaps.</p>
      
      <div className="elimination-stack">
        {/* 1. Intent Clarity */}
        <div className="elimination-block">
          <label>🎯 Intent Clarity <span>(Why THIS internship? max 120 chars)</span></label>
          <input type="text" maxLength={120} value={data.intent || ''} onChange={e => updateData({ intent: e.target.value })} disabled={isAnalyzing} placeholder="Specific goal..." />
          <div className="elimination-feedback">Signal: {diagnostic.intent.level} | <small>{diagnostic.intent.reason}</small></div>
        </div>

        {/* 2. Contribution Readiness */}
        <div className="elimination-block">
          <label>🛠 Contribution Readiness</label>
          <div className="check-stack">
            {["I can independently run tools/software used in the lab", "I can reproduce a paper’s results", "I can work without daily guidance", "I know what problem I’ll work on"].map((txt, i) => (
              <label key={i} className="custom-check">
                <input type="checkbox" checked={data.contrib?.[i] || false} onChange={e => {
                  const arr = [...(data.contrib || [false, false, false, false])];
                  arr[i] = e.target.checked;
                  updateData({ contrib: arr });
                }} disabled={isAnalyzing} /> {txt}
              </label>
            ))}
          </div>
          <div className="elimination-feedback">{diagnostic.contribChecked} / 4 checks. <small>(Apply locked if &lt; 2)</small></div>
        </div>

        {/* 3. Outreach Discipline */}
        <div className="elimination-block">
          <label>📩 Outreach Discipline</label>
          <div className="input-row">
            <input type="number" value={data.outreach || ''} onChange={e => updateData({ outreach: e.target.value })} disabled={isAnalyzing} style={{ width: 80 }} /> 
            <span> professors this month</span>
          </div>
          <div className="elimination-feedback" style={{ color: diagnostic.outreachLevel === 'fail' ? '#f43f5e' : '#10b981' }}>{diagnostic.outreachMsg}</div>
        </div>

        {/* 4. Research Exposure */}
        <div className="elimination-block">
          <label>📚 Research Exposure Level</label>
          <select value={data.researchLevel || 0} onChange={e => updateData({ researchLevel: e.target.value })} disabled={isAnalyzing}>
            <option value={0}>Level 0: Never read papers</option>
            <option value={1}>Level 1: Read but didn’t understand fully</option>
            <option value={2}>Level 2: Understood & summarized</option>
            <option value={3}>Level 3: Used in work/project</option>
          </select>
          {Number(data.researchLevel) < 2 && <div className="diag-warning"><AlertTriangle size={12}/> Research readiness low for Tier-1.</div>}
        </div>

        {/* 5. Timeline Reality */}
        <div className="elimination-block">
          <label>⏳ Availability Window</label>
          <div className="input-row">
            <span>Hours/week:</span>
            <input type="number" value={data.hours || ''} onChange={e => updateData({ hours: e.target.value })} disabled={isAnalyzing} style={{ width: 70 }} />
          </div>
          {Number(data.hours) < 25 && <div className="diag-warning">Labs expect ≥25 hrs/week.</div>}
        </div>

        {/* 6. Coachability */}
        <div className="elimination-block">
          <label>🧠 Coachability Signal</label>
          <select value={data.coachability || ''} onChange={e => updateData({ coachability: e.target.value })} disabled={isAnalyzing}>
            <option value="">Select Reaction to Rejection</option>
            <option value="improve">Improve profile & reapply</option>
            <option value="moreprofs">Apply to more professors</option>
            <option value="giveup">Give up</option>
          </select>
        </div>
      </div>

      <button className="evaluate-btn" onClick={handleScan} disabled={isAnalyzing || diagnostic.applyLocked} style={diagnostic.applyLocked ? { background: '#f43f5e', cursor: 'not-allowed' } : {}}>
        {diagnostic.applyLocked ? "Not aligned for this cycle" : isAnalyzing ? "Analyzing Depth..." : "Execute Deep Analysis"}
      </button>
    </motion.div>
  );
});

const RoadmapStep = ({ status, onNext, onBack }) => (
  <motion.div className="step-container wide-view" variants={variants} custom={1} initial="enter" animate="center" exit="exit">
    <button className="back-link" onClick={onBack}><ChevronLeft size={16}/> Back to Scan</button>
    <header className="roadmap-header">
      <h2 className="ultra-title-small">Research Readiness <span className="text-blue">Protocol</span></h2>
      <div className={`status-tag ${status}`}>
        <Activity size={14} /> {status === 'ready' ? 'HIGH SIGNAL' : 'NOISE DETECTED'}
      </div>
    </header>
    <div className="clean-bento-grid">
      {/* Box 1: Temporal - Large & Clear */}
      <div className="clean-card col-span-2">
        <div className="card-top">
          <span className="mono-label">P-01 // TEMPORAL ALIGNMENT</span>
          <h3>The 120-Day Rule</h3>
        </div>
        <p className="card-desc">Tier-1 lab slots lock 4 months in advance. Applying in March is scavenging for leftovers; elite outreach happens in <strong>November</strong>.</p>
        <div className="timeline-visual">
          <div className="timeline-track">
            <div className="zone safe" style={{width: '40%'}}><span>OPTIMAL</span></div>
            <div className="zone warning" style={{width: '30%'}}><span>RISKY</span></div>
            <div className="zone danger" style={{width: '30%'}}><span>DEAD</span></div>
          </div>
          <div className="timeline-labels">
            <span>OCT</span><span>JAN</span><span>MAR</span><span>MAY</span>
          </div>
        </div>
      </div>
      {/* Box 2: ROI - Vertical Style */}
      <div className="clean-card row-span-2">
        <div className="card-top">
          <span className="mono-label">P-02 // ROI</span>
          <h3>Zero-Training Mandate</h3>
        </div>
        <p className="card-desc">Professors invest in <strong>Assets</strong>, not students who need training. If you can't reproduce a paper on Day 0, you are a liability.</p>
        <div className="metric-box">
          <span className="metric-val">₹5k+</span>
          <span className="metric-unit">Cost per Hour</span>
        </div>
      </div>
      {/* Box 3: Signal */}
      <div className="clean-card">
        <div className="card-top">
          <span className="mono-label">P-03 // SIGNAL</span>
          <h3>Inbox Forensics</h3>
        </div>
        <p className="card-desc">98% of cold emails are noise. High-signal outreach requires <strong>Contextual Alignment</strong> with 2024-25 publications.</p>
      </div>
      {/* Box 4: Elimination */}
      <div className="clean-card">
        <div className="card-top">
          <span className="mono-label">P-04 // RESILIENCE</span>
          <h3>Persistence Filter</h3>
        </div>
        <p className="card-desc">Persitence without profile upgrade is <strong>Spamming</strong>. Real researchers adapt logic, not just numbers.</p>
      </div>
    </div>
    <button 
      className="protocol-action-btn protocol-action-btn--compact" 
      onClick={onNext}
      style={{ width: 'fit-content', alignSelf: 'flex-start', minWidth: 0, padding: '12px 20px', fontSize: '0.98rem', marginTop: 18 }}
    >
      <span style={{ fontWeight: 600 }}>Analyze Quality</span> <ChevronRight size={16} />
    </button>
  </motion.div>
);

const ProtocolStep = ({ onNext, onBack }) => (
  <motion.div className="step-container" variants={variants} custom={1} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}>
    <button className="back-link" onClick={onBack}><ChevronLeft size={16}/> Back to Roadmap</button>
    <h2 className="section-title">Application Anatomy</h2>
    <div className="protocol-box">
      <div className="protocol-item">
        <FileText className="text-blue" />
        <h4>The "Active" CV Framework</h4>
        <p>Remove hobbies. Use action verbs like "Simulated", "Synthesized", or "Optimized".</p>
      </div>
      <div className="protocol-item">
        <Mail className="text-blue" />
        <h4>Value-Based Outreach</h4>
        <p>Subject: Research Inquiry - [Your College] - [Field]. Connect your skills to their latest paper.</p>
      </div>
    </div>
    <button className="glow-button" onClick={onNext}>Final Verification <ChevronRight /></button>
  </motion.div>
);

// --- MAIN COMPONENT ---

const InternshipJourney = () => {
  const [step, setStep] = useState(0); 
  const [direction, setDirection] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profileData, setProfileData] = useState({ 
    cgpa: 7.5, skills: [], intent: '', outreach: 0, contrib: [false,false,false,false], researchLevel: 0, hours: 0, coachability: '' 
  });

  const score = useMemo(() => {
    let s = 0;
    if (profileData.cgpa >= 8) s += 25;
    if (profileData.intent.length > 50) s += 25;
    if (profileData.outreach > 0 && profileData.outreach < 8) s += 20;
    const checks = (profileData.contrib || []).filter(Boolean).length;
    s += (checks * 7.5);
    return Math.min(100, Math.round(s));
  }, [profileData]);

  const userStatus = score > 65 ? 'ready' : 'not-ready';
  
  const handleNext = useCallback((n) => { setDirection(1); setStep(n); }, []);
  const handleBack = useCallback((n) => { setDirection(-1); setStep(n); }, []);

  // Track if improvement plan should be shown
  const [showImprovement, setShowImprovement] = useState(false);

  const handleScan = useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // Diagnostic logic: lock if not qualified
      const diagnostic = (() => {
        const intentClassify = (ans) => {
          if (!ans) return { level: 'weak', reason: 'No answer' };
          if (/exposure|learn|learning|experience/i.test(ans)) return { level: 'weak', reason: 'Focused on learning, not contribution' };
          if (ans.length > 0 && ans.length < 40) return { level: 'semi', reason: 'Somewhat clear, but not specific' };
          return { level: 'strong', reason: 'Specific & aligned' };
        };
        const intent = intentClassify(profileData.intent);
        const contribChecked = profileData.contrib ? profileData.contrib.filter(Boolean).length : 0;
        const outreachLevel = profileData.outreach >= 8 ? 'fail' : profileData.outreach >= 4 ? 'warn' : 'ok';
        let failCount = 0;
        if (intent.level === 'weak') failCount++;
        if (contribChecked < 2) failCount++;
        if (outreachLevel === 'fail') failCount++;
        if (Number(profileData.researchLevel || 0) < 2) failCount++;
        if (Number(profileData.hours || 0) < 25) failCount++;
        if (['giveup', 'moreprofs'].includes(profileData.coachability)) failCount++;
        return { applyLocked: failCount >= 2 };
      })();
      if (diagnostic.applyLocked) {
        setShowImprovement(true);
        handleNext(99); // Special step for improvement plan
      } else {
        setShowImprovement(false);
        handleNext(2);
      }
    }, 2000);
  }, [profileData]);

  useEffect(() => {
    return () => {
      // Remove any global overlay or modal classes
      document.body.classList.remove('modal-open', 'blur-bg', 'dark-overlay');
      // Remove any overlay elements if present
      const overlay = document.querySelector('.your-overlay-class');
      if (overlay) overlay.remove();
    };
  }, []);

  return (
    <div className="internship-journey-root">
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', margin: '18px 0 0 0' }}>
        <button className="glow-button" onClick={() => window.open('/iit-links', '_blank')}>IIT Links</button>
        <button className="glow-button" onClick={() => window.open('/iim-links', '_blank')}>IIM Links</button>
      </div>
      <div className="atyant-ultra-portal">
        <aside className="progress-sidebar">
          <div className="sidebar-header"><Activity size={20} className="text-blue" /> Protocol Tracking</div>
          <div className="progress-track">
            {['Intro', 'Scan', 'Strategy', 'Anatomy', 'Result'].map((label, idx) => (
              <div key={label} className={`track-item ${idx === step ? 'active' : idx < step ? 'completed' : ''}`}>
                <div className="dot"></div><div className="info"><span className="label">{label}</span></div>
              </div>
            ))}
          </div>
          <div className="overall-score">
            <label>Readiness: {score}%</label>
            <div className="score-bar"><motion.div animate={{ width: `${score}%` }} className="fill" /></div>
          </div>
        </aside>

        <main className="portal-content">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && <HeroStep key="h" onNext={() => handleNext(1)} />}
            {step === 1 && <AssessmentStep key="a" data={profileData} updateData={(d) => setProfileData(p => ({...p, ...d}))} handleScan={handleScan} isAnalyzing={isAnalyzing} onBack={() => handleBack(0)} />}
            {step === 2 && !showImprovement && <RoadmapStep key="r" status={userStatus} onNext={() => handleNext(3)} onBack={() => handleBack(1)} />}
            {step === 3 && <ProtocolStep key="p" onNext={() => handleNext(4)} onBack={() => handleBack(2)} />}
            {step === 4 && (
              <motion.div key="f" className="step-container" variants={variants} custom={1} initial="enter" animate="center" exit="exit">
                <button className="back-link" onClick={() => handleBack(3)}><ChevronLeft size={16}/> Back</button>
                <div className="lock-icon-container">
                   <Lock size={80} className={userStatus === 'ready' ? 'icon-ready' : 'icon-locked'} />
                </div>
                <h2 className="section-title">Endorsement Queue</h2>
                <p className="ultra-subtitle">{userStatus === 'ready' ? "Cleared Atyant quality standards." : "Eligibility withheld due to readiness gaps."}</p>
                <button className="primary-cta" disabled={userStatus !== 'ready'}>Request Internal Screening</button>
              </motion.div>
            )}
            {step === 99 && showImprovement && (
              <motion.div key="improve" className="step-container" variants={variants} custom={1} initial="enter" animate="center" exit="exit">
                <button className="back-link" onClick={() => handleBack(1)}><ChevronLeft size={16}/> Back to Scan</button>
                <div className="status-badge error">Protocol Terminated</div>
                <h2 className="section-title">Readiness Gap Detected</h2>
                <p className="ultra-subtitle">The system identified specific signals that would lead to immediate rejection by a Tier-1 professor.</p>
                <div className="gap-analysis-grid">
                  {(() => {
                    const gaps = [];
                    // Intent
                    if (!profileData.intent || /exposure|learn|learning|experience/i.test(profileData.intent) || profileData.intent.length < 40) {
                      gaps.push(
                        <div className="gap-item" key="intent"><AlertTriangle size={18} />
                          <span><strong>Intent Gap:</strong> Clarify your goal. Avoid generic or learning-focused statements.</span>
                        </div>
                      );
                    }
                    // Contribution
                    if ((profileData.contrib || []).filter(Boolean).length < 2) {
                      gaps.push(
                        <div className="gap-item" key="contrib"><AlertTriangle size={18} />
                          <span><strong>Contribution Gap:</strong> Check at least 2 contribution readiness boxes.</span>
                        </div>
                      );
                    }
                    // Outreach
                    if (profileData.outreach >= 8) {
                      gaps.push(
                        <div className="gap-item" key="outreach"><AlertTriangle size={18} />
                          <span><strong>Outreach Gap:</strong> Limit outreach to fewer than 8 professors per month.</span>
                        </div>
                      );
                    }
                    // Research
                    if (Number(profileData.researchLevel) < 2) {
                      gaps.push(
                        <div className="gap-item" key="research"><AlertTriangle size={18} />
                          <span><strong>Research Gap:</strong> Demonstrate research exposure (Level 2+ required).</span>
                        </div>
                      );
                    }
                    // Hours
                    if (Number(profileData.hours) < 25) {
                      gaps.push(
                        <div className="gap-item" key="hours"><AlertTriangle size={18} />
                          <span><strong>Commitment Gap:</strong> Tier-1 research requires ≥25 hrs/week. Your availability is insufficient.</span>
                        </div>
                      );
                    }
                    // Coachability
                    if (["giveup", "moreprofs"].includes(profileData.coachability)) {
                      gaps.push(
                        <div className="gap-item" key="coachability"><AlertTriangle size={18} />
                          <span><strong>Coachability Gap:</strong> "Improve profile & reapply" is the only accepted response to rejection.</span>
                        </div>
                      );
                    }
                    return gaps.length ? gaps : <div className="gap-item"><AlertTriangle size={18} /> <span>No specific gaps detected, but minimum criteria not met.</span></div>;
                  })()}
                </div>
                <button className="secondary-cta" onClick={() => handleBack(1)}>Re-calibrate Profile</button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default InternshipJourney;