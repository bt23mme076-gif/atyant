import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="pp-page">
      <div className="pp-ambient" aria-hidden="true" />

      {/* ── HERO ── */}
      <div className="pp-wrap">
        <div className="pp-hero">
          <div className="pp-hero-label">Legal &amp; Trust</div>
          <h1 className="pp-hero-title">
            Privacy<br />
            <em>Policy</em>
          </h1>
          <div className="pp-hero-meta">
            <div className="pp-meta-item">
              <span className="pp-meta-dot" />
              Effective: May 12, 2026
            </div>
            <div className="pp-meta-item">
              <span className="pp-meta-dot" />
              Last updated: May 12, 2026
            </div>
            <div className="pp-meta-item">
              <span className="pp-meta-dot" />
              Governed by Indian law
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="pp-layout">

          {/* ── SIDEBAR TOC ── */}
          <aside className="pp-sidebar">
            <div className="pp-toc-label">Contents</div>
            <ul className="pp-toc-list">
              {[
                ['01', 'Who we are', '#who-we-are'],
                ['02', 'Data we collect', '#data-we-collect'],
                ['03', 'Google Calendar', '#google-calendar-access'],
                ['04', 'How we use data', '#how-we-use'],
                ['05', 'Who can see data', '#who-sees'],
                ['06', 'Data retention', '#retention'],
                ['07', 'Your rights', '#your-rights'],
                ['08', 'Contact us', '#contact-us'],
              ].map(([num, name, href]) => (
                <li className="pp-toc-item" key={num}>
                  <a href={href}>
                    <span className="pp-toc-num">{num}</span>
                    <span className="pp-toc-name">{name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* ── SECTIONS ── */}
          <main className="pp-main">

            {/* 01 — Who we are */}
            <section className="pp-section" id="who-we-are">
              <div className="pp-section-head">
                <span className="pp-section-num">01</span>
                <h2 className="pp-section-title">Who we are</h2>
              </div>
              <p className="pp-body">
                Atyant ("we", "our", "us") is a career guidance and mentorship platform that connects students from Tier-2 and Tier-3 Indian colleges with verified senior mentors across industries. We are operated by the Atyant team and accessible at{' '}
                <a href="https://atyant.in" target="_blank" rel="noopener noreferrer">atyant.in</a>.
              </p>
              <p className="pp-body">
                This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform as a student, mentor, or visitor.
              </p>
            </section>

            {/* 02 — Data we collect */}
            <section className="pp-section" id="data-we-collect">
              <div className="pp-section-head">
                <span className="pp-section-num">02</span>
                <h2 className="pp-section-title">Data we collect</h2>
              </div>
              <p className="pp-body">We collect information you provide directly and information generated through your use of our platform.</p>
              <div className="pp-table-wrap">
                <table className="pp-table">
                  <thead>
                    <tr>
                      <th>Data type</th>
                      <th>What it includes</th>
                      <th>How collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Account info', 'Name, email address, profile photo, college/company, graduation year', 'Registration form or Google Sign-In'],
                      ['Profile data', 'Skills, career goals, mentorship preferences, bio, LinkedIn URL', 'Onboarding and profile setup'],
                      ['Session data', 'Booked sessions, session history, mentor ratings, feedback', 'Automatically via platform activity'],
                      ['Google account info', 'Google account email (used for authentication and calendar linking)', 'Google OAuth sign-in'],
                      ['Calendar events', 'Mentorship session events created or managed on your Google Calendar', 'Google Calendar API (mentors only, with explicit consent)'],
                      ['Usage data', 'Pages visited, features used, device type, browser type, IP address', 'Automatically via Umami analytics'],
                      ['Communications', 'Messages sent on the platform, support requests', 'In-app messaging and WhatsApp Business'],
                    ].map(([type, includes, how]) => (
                      <tr key={type}>
                        <td><strong>{type}</strong></td>
                        <td>{includes}</td>
                        <td>{how}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 03 — Google Calendar */}
            <section className="pp-section" id="google-calendar-access">
              <div className="pp-section-head">
                <span className="pp-section-num">03</span>
                <h2 className="pp-section-title">Google Calendar access</h2>
              </div>
              <div className="pp-callout">
                <span className="pp-callout-icon">📅</span>
                <p className="pp-callout-text">
                  This section covers our use of the <code>calendar.events</code> Google API scope — required for mentors to create and manage session booking slots.
                </p>
              </div>
              <div className="pp-card-grid">
                <div className="pp-card">
                  <div className="pp-card-icon">🔗</div>
                  <div className="pp-card-title">Why we request calendar access</div>
                  <p className="pp-card-body">Atyant allows mentors to create Google Meet booking slots for student mentorship sessions. We use the <code style={{ fontFamily: 'monospace', fontSize: '12px', background: 'rgba(200,245,74,0.1)', color: '#C8F54A', padding: '1px 6px', borderRadius: '3px' }}>calendar.events</code> scope to create, update, and delete session events in their Google Calendar.</p>
                </div>
                <div className="pp-card">
                  <div className="pp-card-icon">🔍</div>
                  <div className="pp-card-title">What we access</div>
                  <p className="pp-card-body">We only access calendar events that we create or manage for Atyant sessions. We do not read, scan, or store any pre-existing calendar events, personal appointments, or other calendar data.</p>
                </div>
                <div className="pp-card">
                  <div className="pp-card-icon">👤</div>
                  <div className="pp-card-title">Who this applies to</div>
                  <p className="pp-card-body">Calendar access is requested only from mentors, not from students. Mentors see an explicit consent screen before any calendar access is granted.</p>
                </div>
                <div className="pp-card">
                  <div className="pp-card-icon">🔓</div>
                  <div className="pp-card-title">Revoking access</div>
                  <p className="pp-card-body">Mentors can disconnect Google Calendar anytime from account settings or via{' '}
                    <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>. Revoking access will not delete your Atyant account.</p>
                </div>
              </div>
              <div className="pp-notice">
                <strong>No data sharing:</strong> Calendar event data is never sold, rented, or shared with third parties for advertising or any purpose other than operating the Atyant session booking feature.
              </div>
            </section>

            {/* 04 — How we use data */}
            <section className="pp-section" id="how-we-use">
              <div className="pp-section-head">
                <span className="pp-section-num">04</span>
                <h2 className="pp-section-title">How we use your data</h2>
              </div>
              <div className="pp-table-wrap">
                <table className="pp-table">
                  <thead>
                    <tr>
                      <th>Purpose</th>
                      <th>Data used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Matching students with mentors', 'Profile data, career goals, academic background'],
                      ['Booking and scheduling sessions', 'Calendar events, session preferences, Google account email'],
                      ['Sending session reminders', 'Email address, WhatsApp number (if provided)'],
                      ['Platform analytics and improvement', 'Usage data (anonymised, via self-hosted Umami)'],
                      ['Customer support', 'Account info, session history, communications'],
                      ['Legal compliance', 'Account info as required by applicable law'],
                    ].map(([purpose, data]) => (
                      <tr key={purpose}>
                        <td><strong>{purpose}</strong></td>
                        <td>{data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pp-notice">
                <strong>Zero ads policy:</strong> We do not use your data for advertising. We do not sell your data to any third party. Ever.
              </div>
            </section>

            {/* 05 — Who can see data */}
            <section className="pp-section" id="who-sees">
              <div className="pp-section-head">
                <span className="pp-section-num">05</span>
                <h2 className="pp-section-title">Who can see your data</h2>
              </div>
              <p className="pp-body">We limit data access to only what is necessary for each interaction.</p>
              <div className="pp-audience-grid">
                {[
                  ['Students', 'Their own profile, session history, and mentor\'s public profile'],
                  ['Mentors', 'Student\'s name, college, career goals, and booked session details'],
                  ['Atyant team', 'Account and usage data for support and platform operations only'],
                  ['Third parties', 'None — we do not share personal data with third parties for any commercial purpose'],
                ].map(([label, desc]) => (
                  <div className="pp-audience-item" key={label}>
                    <div className="pp-audience-label">{label}</div>
                    <p className="pp-audience-desc">{desc}</p>
                  </div>
                ))}
              </div>
              <p className="pp-body" style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
                Session-specific information is visible only to the two participants of that session.
              </p>
            </section>

            {/* 06 — Data retention */}
            <section className="pp-section" id="retention">
              <div className="pp-section-head">
                <span className="pp-section-num">06</span>
                <h2 className="pp-section-title">Data retention</h2>
              </div>
              <p className="pp-body">We retain your data for as long as your account is active or as needed to provide our services.</p>
              <p className="pp-body">
                If you request deletion of your account, we will delete your personal data within <strong style={{ color: 'var(--text-primary)' }}>30 days</strong>, except where we are required by law to retain certain records. Calendar events created in your Google Calendar by Atyant will need to be manually deleted from your Google Calendar — we will not retain any copy of them after account deletion.
              </p>
            </section>

            {/* 07 — Your rights */}
            <section className="pp-section" id="your-rights">
              <div className="pp-section-head">
                <span className="pp-section-num">07</span>
                <h2 className="pp-section-title">Your rights</h2>
              </div>
              <p className="pp-body">
                You have the right to access, correct, or delete your personal data at any time. You may also withdraw consent for data collection (including Google Calendar access) at any time.
              </p>
              <p className="pp-body">
                To exercise any of these rights, contact us at the email below. We will respond within <strong style={{ color: 'var(--text-primary)' }}>7 business days</strong>.
              </p>
              <div className="pp-security-row">
                <div className="pp-security-icon">🔒</div>
                <p className="pp-security-text">
                  <strong>Self-hosted analytics.</strong> Atyant uses Umami analytics hosted on our own servers at analytics.atyant.in — your usage data is never sent to Google Analytics or any third-party analytics provider.
                </p>
              </div>
            </section>

            {/* 08 — Contact */}
            <section className="pp-section" id="contact-us" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <div className="pp-section-head">
                <span className="pp-section-num">08</span>
                <h2 className="pp-section-title">Contact us</h2>
              </div>
              <p className="pp-body">
                For privacy-related questions, data requests, or to report a concern, reach out to us directly. We take every request seriously.
              </p>
              <div className="pp-contact-block">
                <div className="pp-contact-top">
                  <div className="pp-contact-avatar">AT</div>
                  <div>
                    <div className="pp-contact-name">Atyant Privacy Team</div>
                    <div className="pp-contact-role">Responds within 7 business days</div>
                  </div>
                </div>
                <div className="pp-contact-bottom">
                  <a href="mailto:nitin@atyant.in" className="pp-contact-link primary">
                    ✉ nitin@atyant.in
                  </a>
                  <a href="https://atyant.in" target="_blank" rel="noopener noreferrer" className="pp-contact-link secondary">
                    ↗ atyant.in
                  </a>
                  <a href="/terms" className="pp-contact-link secondary">
                    ↗ Terms of Service
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

export default PrivacyPolicy;