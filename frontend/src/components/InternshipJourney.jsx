import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, Lock, Rocket, Target, ShieldCheck, 
  Search, FileText, Mail, ChevronRight, ChevronLeft, Activity, Info, AlertTriangle
} from 'lucide-react';
import './InternshipJourney.css';

const variants = {
  enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 50 : -50, opacity: 0 })
};

// --- SUB-COMPONENTS ---

const HeroStep = React.memo(({ onNext }) => (
  <motion.div className="step-container" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4 }}>
    <div className="badge">Quality-First Protocol</div>
    <h1 className="ultra-title">Internships don't fail because of <span className="gradient-text">effort.</span><br/>They fail because of <span className="gradient-text-red">execution.</span></h1>
    <p className="ultra-subtitle">Professor inboxes are graveyards of generic emails. Atyant is the filter that ensures your profile is respected, not just seen.</p>
    <div className="hero-actions">
      <button className="glow-button outline" onClick={() => window.open('https://forms.gle/qzBr4YNpVavv52cB9', '_blank')}>Get Free Resume Review</button>
      <button className="glow-button locked" disabled>
        <Lock size={18} />
        Start Readiness Scan <Search size={18} />
      </button>
    </div>
  </motion.div>
));

const AssessmentStep = React.memo(({ data, updateData, onBack, isAnalyzing, handleScan }) => {
  const diagnostic = useMemo(() => {
    const intentClassify = (ans) => {
      if (!ans) return { level: 'weak', reason: 'No answer' };
      if (/exposure|learn|learning|experience/i.test(ans)) return { level: 'weak', reason: 'Focus on contribution' };
      if (ans.length > 0 && ans.length < 40) return { level: 'semi', reason: 'Be more specific' };
      return { level: 'strong', reason: 'Aligned' };
    };

    const intent = intentClassify(data.intent);
    const contribChecked = data.contrib ? data.contrib.filter(Boolean).length : 0;
    const outreachLevel = data.outreach >= 8 ? 'fail' : data.outreach >= 4 ? 'warn' : 'ok';
    const outreachMsg = data.outreach >= 8 ? 'High spam risk.' : data.outreach >= 4 ? 'Borderline mass outreach.' : 'Disciplined outreach.';
    
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
    <motion.div className="step-container scrollable-step" variants={variants} initial="enter" animate="center" exit="exit">
      <button className="back-link" onClick={onBack}><ChevronLeft size={16}/> Back to Intro</button>
      <h2 className="section-title">Profile Deep-Scan</h2>
      
      <div className="elimination-stack">
        <div className="elimination-block">
          <label>🎯 Intent Clarity <span>(Max 120 chars)</span></label>
          <input type="text" maxLength={120} value={data.intent || ''} onChange={e => updateData({ intent: e.target.value })} disabled={isAnalyzing} placeholder="Why this internship?" />
          <div className="elimination-feedback">Signal: {diagnostic.intent.level} | <small>{diagnostic.intent.reason}</small></div>
        </div>

        <div className="elimination-block">
          <label>🛠 Contribution Readiness</label>
          <div className="check-stack">
            {["I can independently run tools", "I can reproduce a paper", "I can work without daily guidance", "I know the specific problem"].map((txt, i) => (
              <label key={i} className="custom-check">
                <input type="checkbox" checked={data.contrib?.[i] || false} onChange={e => {
                  const arr = [...(data.contrib || [false, false, false, false])];
                  arr[i] = e.target.checked;
                  updateData({ contrib: arr });
                }} disabled={isAnalyzing} /> {txt}
              </label>
            ))}
          </div>
        </div>

        <div className="elimination-grid">
            <div className="elimination-block">
                <label>📩 Outreach</label>
                <div className="input-row">
                    <input type="number" value={data.outreach || ''} onChange={e => updateData({ outreach: e.target.value })} disabled={isAnalyzing} />
                    <span>Profs/mo</span>
                </div>
            </div>
            <div className="elimination-block">
                <label>⏳ Hours/week</label>
                <div className="input-row">
                    <input type="number" value={data.hours || ''} onChange={e => updateData({ hours: e.target.value })} disabled={isAnalyzing} />
                    <span>Hrs</span>
                </div>
            </div>
        </div>

        <div className="elimination-block">
          <label>📚 Research Exposure</label>
          <select value={data.researchLevel || 0} onChange={e => updateData({ researchLevel: e.target.value })} disabled={isAnalyzing}>
            <option value={0}>Level 0: Never read papers</option>
            <option value={1}>Level 1: Basic understanding</option>
            <option value={2}>Level 2: Understood & summarized</option>
            <option value={3}>Level 3: Used in work/project</option>
          </select>
        </div>

        <div className="elimination-block">
          <label>🧠 Coachability Signal</label>
          <select value={data.coachability || ''} onChange={e => updateData({ coachability: e.target.value })} disabled={isAnalyzing}>
            <option value="">Reaction to Rejection</option>
            <option value="improve">Improve profile & reapply</option>
            <option value="moreprofs">Apply to more professors</option>
            <option value="giveup">Give up</option>
          </select>
        </div>
      </div>

      <button className="evaluate-btn" onClick={handleScan} disabled={isAnalyzing || diagnostic.applyLocked}>
        {diagnostic.applyLocked ? "Not aligned for this cycle" : isAnalyzing ? "Analyzing Depth..." : "Execute Deep Analysis"}
      </button>
    </motion.div>
  );
});

const RoadmapStep = ({ status, onNext, onBack }) => (
  <motion.div className="step-container wide-view" variants={variants} initial="enter" animate="center" exit="exit">
    <button className="back-link" onClick={onBack}><ChevronLeft size={16}/> Back to Scan</button>
    <header className="roadmap-header">
      <h2 className="ultra-title-small">Research <span className="text-blue">Protocol</span></h2>
      <div className={`status-tag ${status}`}>
        <Activity size={14} /> {status === 'ready' ? 'HIGH SIGNAL' : 'NOISE DETECTED'}
      </div>
    </header>
    <div className="clean-bento-grid">
      <div className="clean-card col-span-2">
        <div className="card-top">
          <span className="mono-label">P-01 // TEMPORAL</span>
          <h3>The 120-Day Rule</h3>
        </div>
        <p className="card-desc">Elite outreach happens in <strong>November</strong>. March is scavenging for leftovers.</p>
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
      <div className="clean-card">
        <div className="card-top">
          <span className="mono-label">P-02 // ROI</span>
          <h3>Zero-Training</h3>
        </div>
        <p className="card-desc">Professors invest in <strong>Assets</strong>. If you need training on Day 0, you are a liability.</p>
      </div>
      <div className="clean-card">
        <div className="card-top">
          <span className="mono-label">P-03 // SIGNAL</span>
          <h3>Inbox Forensics</h3>
        </div>
        <p className="card-desc">98% of cold emails are noise. High-signal requires <strong>Contextual Alignment</strong>.</p>
      </div>
    </div>
    <button className="protocol-action-btn" onClick={onNext}>
      Analyze Quality <ChevronRight size={16} />
    </button>
  </motion.div>
);

const ProtocolStep = ({ onNext, onBack }) => (
  <motion.div className="step-container" variants={variants} initial="enter" animate="center" exit="exit">
    <button className="back-link" onClick={onBack}><ChevronLeft size={16}/> Back to Roadmap</button>
    <h2 className="section-title">Application Anatomy</h2>
    <div className="protocol-box">
      <div className="protocol-item">
        <FileText className="text-blue" />
        <div className="protocol-text">
            <h4>The "Active" CV</h4>
            <p>Use action verbs like "Simulated" or "Optimized".</p>
        </div>
      </div>
      <div className="protocol-item">
        <Mail className="text-blue" />
        <div className="protocol-text">
            <h4>Value Outreach</h4>
            <p>Connect skills to their latest 2025 paper.</p>
        </div>
      </div>
    </div>
    <button className="glow-button" onClick={onNext}>Final Verification <ChevronRight /></button>
  </motion.div>
);

const InternshipJourney = () => {
  const [step, setStep] = useState(0); 
  const [direction, setDirection] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showImprovement, setShowImprovement] = useState(false);
  const [profileData, setProfileData] = useState({ 
    cgpa: 7.5, intent: '', outreach: 0, contrib: [false,false,false,false], researchLevel: 0, hours: 0, coachability: '' 
  });

  const score = useMemo(() => {
    let s = 0;
    if (profileData.intent.length > 50) s += 40;
    if (profileData.outreach > 0 && profileData.outreach < 8) s += 20;
    const checks = (profileData.contrib || []).filter(Boolean).length;
    s += (checks * 10);
    return Math.min(100, Math.round(s));
  }, [profileData]);

  const userStatus = score > 65 ? 'ready' : 'not-ready';
  
  const handleNext = useCallback((n) => { setDirection(1); setStep(n); }, []);
  const handleBack = useCallback((n) => { setDirection(-1); setStep(n); }, []);

  const handleScan = useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const isLocked = (profileData.intent.length < 20 || profileData.hours < 10); // Simplified logic check
      if (isLocked) {
        setShowImprovement(true);
        handleNext(99);
      } else {
        setShowImprovement(false);
        handleNext(2);
      }
    }, 1500);
  }, [profileData, handleNext]);

  return (
    <div className="internship-journey-root">
      <div className="atyant-ultra-portal">
        <aside className="progress-sidebar">
          <div className="sidebar-header"><Activity size={20} /> Protocol</div>
          <div className="progress-track">
            {['Intro', 'Scan', 'Strategy', 'Anatomy', 'Result'].map((label, idx) => (
              <div key={label} className={`track-item ${idx === step ? 'active' : idx < (step === 99 ? 1 : step) ? 'completed' : ''}`}>
                <div className="dot"></div>
                <span className="label">{label}</span>
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
            {step === 2 && <RoadmapStep key="r" status={userStatus} onNext={() => handleNext(3)} onBack={() => handleBack(1)} />}
            {step === 3 && <ProtocolStep key="p" onNext={() => handleNext(4)} onBack={() => handleBack(2)} />}
            {step === 4 && (
              <motion.div key="f" className="step-container centered" variants={variants} initial="enter" animate="center" exit="exit">
                <Lock size={60} className={userStatus === 'ready' ? 'icon-ready' : 'icon-locked'} />
                <h2 className="section-title">Endorsement</h2>
                <p className="ultra-subtitle">{userStatus === 'ready' ? "Cleared quality standards." : "Eligibility withheld."}</p>
                <button className="primary-cta" disabled={userStatus !== 'ready'}>Request Screening</button>
              </motion.div>
            )}
            {step === 99 && (
               <motion.div key="improve" className="step-container" variants={variants} initial="enter" animate="center" exit="exit">
                    <button className="back-link" onClick={() => handleBack(1)}><ChevronLeft size={16}/> Back</button>
                    <div className="status-badge error">Gap Detected</div>
                    <h2 className="section-title">Improvement Plan</h2>
                    <div className="gap-analysis-grid">
                        <div className="gap-item"><AlertTriangle size={18} /><span>Enhance your contribution readiness profile.</span></div>
                    </div>
                    <button className="secondary-cta" onClick={() => handleBack(1)}>Re-calibrate</button>
               </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default InternshipJourney;