import React from 'react';
import './TermsOfService.css';

const CheckIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 5l2.5 2.5L8 3" />
  </svg>
);

const tocItems = [
  ['01', 'Acceptance of terms', '#acceptance'],
  ['02', 'Who can use Atyant', '#eligibility'],
  ['03', 'Platform description', '#platform'],
  ['04', 'User responsibilities', '#responsibilities'],
  ['05', 'Mentor conduct', '#mentors'],
  ['06', 'No guarantee of outcomes', '#outcomes'],
  ['07', 'Intellectual property', '#ip'],
  ['08', 'Account suspension', '#suspension'],
  ['09', 'Limitation of liability', '#liability'],
  ['10', 'Governing law', '#governing'],
  ['11', 'Changes to these terms', '#changes'],
  ['12', 'Contact us', '#contact'],
];

const TermsOfService = () => {
  return (
    <div className="tos-page">
      <div className="tos-ambient" aria-hidden="true" />

      <div className="tos-wrap">

        {/* ── HERO ── */}
        <div className="tos-hero">
          <div className="tos-hero-label">Legal &amp; Trust</div>
          <h1 className="tos-hero-title">
            Terms of<br />
            <em>Service</em>
          </h1>
          <div className="tos-hero-meta">
            <div className="tos-meta-item">
              <span className="tos-meta-dot" />
              Effective: May 12, 2026
            </div>
            <div className="tos-meta-item">
              <span className="tos-meta-dot" />
              Last updated: May 12, 2026
            </div>
            <div className="tos-meta-item">
              <span className="tos-meta-dot" />
              Governed by Indian law
            </div>
          </div>
        </div>

        {/* ── GRID ── */}
        <div className="tos-layout">

          {/* ── SIDEBAR ── */}
          <aside className="tos-sidebar">
            <div className="tos-toc-label">Contents</div>
            <ul className="tos-toc-list">
              {tocItems.map(([num, name, href]) => (
                <li className="tos-toc-item" key={num}>
                  <a href={href}>
                    <span className="tos-toc-num">{num}</span>
                    <span className="tos-toc-name">{name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* ── CONTENT ── */}
          <main className="tos-main">

            {/* 01 — Acceptance */}
            <section className="tos-section" id="acceptance">
              <div className="tos-section-head">
                <span className="tos-section-num">01</span>
                <h2 className="tos-section-title">Acceptance of terms</h2>
              </div>
              <p className="tos-body">
                By accessing or using the Atyant platform at <a href="https://atyant.in">atyant.in</a>, you agree to be bound by these Terms of Service ("Terms"). If you do not agree with any part of these Terms, you must not use our platform.
              </p>
              <p className="tos-body">
                These Terms constitute a legally binding agreement between you and Atyant. We recommend reading them carefully before creating an account or booking a session.
              </p>
              <div className="tos-notice">
                <strong>Plain English:</strong> Using Atyant means you accept these rules. If something is unclear, email us at <a href="mailto:nitin@atyant.in" style={{ color: 'var(--accent)' }}>nitin@atyant.in</a> before using the platform.
              </div>
            </section>

            {/* 02 — Eligibility */}
            <section className="tos-section" id="eligibility">
              <div className="tos-section-head">
                <span className="tos-section-num">02</span>
                <h2 className="tos-section-title">Who can use Atyant</h2>
              </div>
              <p className="tos-body">You may use Atyant only if you meet all of the following conditions:</p>
              <div className="tos-clause-list">
                {[
                  ['Age requirement', 'You are at least 16 years of age. Users under 18 should have parental awareness of their use of the platform.'],
                  ['Legal capacity', 'You have the legal capacity to enter into binding agreements under applicable law.'],
                  ['Accurate information', 'You provide truthful, accurate, and complete information when registering. False profiles — including fake credentials or fabricated work experience for mentors — will result in immediate account termination.'],
                  ['Single account', 'You maintain only one account per person. Duplicate accounts are not permitted.'],
                  ['No prior bans', 'You have not previously been suspended or permanently banned from Atyant for violating these Terms.'],
                ].map(([title, text]) => (
                  <div className="tos-clause" key={title}>
                    <div className="tos-clause-bullet"><CheckIcon /></div>
                    <p className="tos-clause-text"><strong>{title} — </strong>{text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 03 — Platform */}
            <section className="tos-section" id="platform">
              <div className="tos-section-head">
                <span className="tos-section-num">03</span>
                <h2 className="tos-section-title">Platform description</h2>
              </div>
              <p className="tos-body">
                Atyant is a career guidance and mentorship platform that connects students from Tier-2 and Tier-3 Indian colleges with verified senior mentors from industry, academia, and entrepreneurship.
              </p>
              <div className="tos-card-grid">
                <div className="tos-card">
                  <div className="tos-card-icon">🎓</div>
                  <div className="tos-card-title">For students</div>
                  <p className="tos-card-body">Discover and book one-on-one mentorship sessions, access career guidance, explore job opportunities through our verified marketplace, and receive referrals from mentors.</p>
                </div>
                <div className="tos-card">
                  <div className="tos-card-icon">🧭</div>
                  <div className="tos-card-title">For mentors</div>
                  <p className="tos-card-body">Offer mentorship sessions, share career insights, guide students through live Q&A sessions, and provide referrals to students you believe in. Mentors are verified by our team before going live.</p>
                </div>
                <div className="tos-card">
                  <div className="tos-card-icon">💼</div>
                  <div className="tos-card-title">Job marketplace</div>
                  <p className="tos-card-body">Mentors can post verified job openings. Atyant does not act as a recruitment agency and is not responsible for hiring decisions made by employers.</p>
                </div>
                <div className="tos-card">
                  <div className="tos-card-icon">📅</div>
                  <div className="tos-card-title">Google Calendar integration</div>
                  <p className="tos-card-body">Mentors may connect their Google Calendar to manage session availability. This integration is optional and governed separately by our Privacy Policy.</p>
                </div>
              </div>
            </section>

            {/* 04 — Responsibilities */}
            <section className="tos-section" id="responsibilities">
              <div className="tos-section-head">
                <span className="tos-section-num">04</span>
                <h2 className="tos-section-title">User responsibilities</h2>
              </div>
              <p className="tos-body">All users — students and mentors alike — agree to the following standards of conduct on the platform:</p>
              <div className="tos-clause-list">
                {[
                  ['Respectful communication', 'Treat all users with respect. Harassment, discrimination, offensive language, or threatening behaviour of any kind will result in immediate account suspension.'],
                  ['No misuse of sessions', 'Sessions booked on Atyant must be used for genuine career guidance. Using sessions to solicit personal favours, promote competing services, or recruit users off-platform is prohibited.'],
                  ['No solicitation of payment off-platform', 'Do not request or accept payment for mentorship services outside of Atyant\'s official payment system.'],
                  ['Privacy of sessions', 'Session conversations are confidential. Recording a session without the other participant\'s explicit consent is prohibited.'],
                  ['No spam or unsolicited outreach', 'Do not use Atyant\'s messaging system to send bulk messages, promotional content, or unsolicited contact requests.'],
                  ['Accurate representation', 'Do not misrepresent your qualifications, job title, college, or any professional information on your profile.'],
                ].map(([title, text]) => (
                  <div className="tos-clause" key={title}>
                    <div className="tos-clause-bullet"><CheckIcon /></div>
                    <p className="tos-clause-text"><strong>{title} — </strong>{text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 05 — Mentors */}
            <section className="tos-section" id="mentors">
              <div className="tos-section-head">
                <span className="tos-section-num">05</span>
                <h2 className="tos-section-title">Mentor conduct</h2>
              </div>
              <p className="tos-body">
                Mentors on Atyant are verified individuals who have agreed to provide genuine career guidance. By registering as a mentor, you additionally agree to:
              </p>
              <div className="tos-clause-list">
                {[
                  ['Honesty about credentials', 'Your profile must accurately reflect your current role, company, and experience. Fabricated or inflated credentials will result in permanent removal.'],
                  ['Session quality', 'Conduct sessions with professionalism and genuine intent to help. Repeatedly cancelling sessions or showing up unprepared may result in your mentor account being reviewed or suspended.'],
                  ['No conflict of interest', 'Disclose any material conflict of interest before providing advice — e.g., recommending a company you have a financial stake in.'],
                  ['Referral integrity', 'Referrals provided through Atyant\'s referral system must be genuine. Do not provide referrals in exchange for payment, favours, or reciprocal referrals.'],
                ].map(([title, text]) => (
                  <div className="tos-clause" key={title}>
                    <div className="tos-clause-bullet"><CheckIcon /></div>
                    <p className="tos-clause-text"><strong>{title} — </strong>{text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 06 — No guarantee */}
            <section className="tos-section" id="outcomes">
              <div className="tos-section-head">
                <span className="tos-section-num">06</span>
                <h2 className="tos-section-title">No guarantee of outcomes</h2>
              </div>
              <div className="tos-warning">
                <strong>Important:</strong> Atyant is a mentorship platform, not a placement agency. Connecting with a mentor or receiving a referral does not guarantee a job offer, internship, or admission to any program.
              </div>
              <p className="tos-body">
                Mentors provide guidance based on their personal experience and professional judgment. Their advice does not constitute professional legal, financial, medical, or career consulting advice. Atyant is not liable for decisions made by users based on mentor guidance.
              </p>
              <p className="tos-body">
                Session outcomes depend on many factors outside Atyant's control — including the student's effort, qualifications, and market conditions. Atyant makes no representations or warranties about career outcomes resulting from use of the platform.
              </p>
            </section>

            {/* 07 — IP */}
            <section className="tos-section" id="ip">
              <div className="tos-section-head">
                <span className="tos-section-num">07</span>
                <h2 className="tos-section-title">Intellectual property</h2>
              </div>
              <p className="tos-body">
                All content on the Atyant platform — including the name, logo, design, software, AnswerCards, and written content produced by Atyant — is the exclusive property of Atyant and protected under applicable intellectual property law.
              </p>
              <p className="tos-body">
                Content you create on the platform (profile information, session notes, feedback) remains yours. By posting it on Atyant, you grant us a non-exclusive, royalty-free licence to display and use it to operate the platform.
              </p>
              <div className="tos-notice">
                <strong>AnswerCards:</strong> Session summaries and AnswerCards generated on Atyant may be shared publicly to help other students, with personally identifying information removed unless you consent otherwise.
              </div>
            </section>

            {/* 08 — Suspension */}
            <section className="tos-section" id="suspension">
              <div className="tos-section-head">
                <span className="tos-section-num">08</span>
                <h2 className="tos-section-title">Account suspension</h2>
              </div>
              <p className="tos-body">
                Atyant reserves the right to suspend or permanently terminate any account that violates these Terms, at our sole discretion, with or without prior notice depending on the severity of the violation.
              </p>
              <div className="tos-clause-list">
                {[
                  ['Immediate termination', 'Fake credentials, harassment, payment fraud, or any activity that harms another user will result in immediate permanent ban without warning.'],
                  ['Warning first', 'Minor violations — such as a single missed session without cancellation or minor profile inaccuracies — will typically receive a warning before action is taken.'],
                  ['Appeal process', 'If you believe your account was suspended in error, you may appeal by emailing nitin@atyant.in within 14 days of suspension. We will review and respond within 7 business days.'],
                ].map(([title, text]) => (
                  <div className="tos-clause" key={title}>
                    <div className="tos-clause-bullet"><CheckIcon /></div>
                    <p className="tos-clause-text"><strong>{title} — </strong>{text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 09 — Liability */}
            <section className="tos-section" id="liability">
              <div className="tos-section-head">
                <span className="tos-section-num">09</span>
                <h2 className="tos-section-title">Limitation of liability</h2>
              </div>
              <p className="tos-body">
                To the maximum extent permitted by applicable law, Atyant and its team members shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of employment opportunity, loss of income, or loss of data — arising from your use of or inability to use the platform.
              </p>
              <p className="tos-body">
                Atyant's total liability for any claim arising out of or related to these Terms or the platform shall not exceed the amount you paid to Atyant in the three months preceding the claim, or ₹500, whichever is greater.
              </p>
              <div className="tos-warning">
                <strong>Platform availability:</strong> Atyant does not guarantee 100% uptime. We may occasionally take the platform offline for maintenance. We are not liable for losses resulting from temporary unavailability.
              </div>
            </section>

            {/* 10 — Governing law */}
            <section className="tos-section" id="governing">
              <div className="tos-section-head">
                <span className="tos-section-num">10</span>
                <h2 className="tos-section-title">Governing law</h2>
              </div>
              <p className="tos-body">
                These Terms are governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of Atyant shall be subject to the exclusive jurisdiction of the courts of Nagpur, Maharashtra, India.
              </p>
              <p className="tos-body">
                If any provision of these Terms is found to be invalid or unenforceable by a court, the remaining provisions will continue in full force and effect.
              </p>
            </section>

            {/* 11 — Changes */}
            <section className="tos-section" id="changes">
              <div className="tos-section-head">
                <span className="tos-section-num">11</span>
                <h2 className="tos-section-title">Changes to these terms</h2>
              </div>
              <p className="tos-body">
                We may update these Terms from time to time. When we make material changes, we will notify registered users via email and display a notice on the platform. Your continued use of Atyant after changes take effect constitutes acceptance of the revised Terms.
              </p>
              <div className="tos-version-table">
                <div className="tos-version-row">
                  <span className="tos-version-tag current">v1.0 — current</span>
                  <span className="tos-version-date">May 12, 2026</span>
                  <span className="tos-version-note">Initial release</span>
                </div>
              </div>
            </section>

            {/* 12 — Contact */}
            <section className="tos-section" id="contact">
              <div className="tos-section-head">
                <span className="tos-section-num">12</span>
                <h2 className="tos-section-title">Contact us</h2>
              </div>
              <p className="tos-body">
                For questions about these Terms, account disputes, or legal notices, reach out to us directly. We respond to all legal inquiries within 7 business days.
              </p>
              <div className="tos-contact-block">
                <div className="tos-contact-top">
                  <div className="tos-contact-avatar">AT</div>
                  <div>
                    <div className="tos-contact-name">Atyant Legal Team</div>
                    <div className="tos-contact-role">Responds within 7 business days</div>
                  </div>
                </div>
                <div className="tos-contact-bottom">
                  <a href="mailto:nitin@atyant.in" className="tos-contact-link primary">
                    nitin@atyant.in
                  </a>
                  <a href="https://atyant.in" target="_blank" rel="noopener noreferrer" className="tos-contact-link secondary">
                    ↗ atyant.in
                  </a>
                  <a href="https://atyant.in/privacy" className="tos-contact-link secondary">
                    ↗ Privacy Policy
                  </a>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;