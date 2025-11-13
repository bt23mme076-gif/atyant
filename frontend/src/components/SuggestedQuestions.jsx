import React from 'react';

const SUGGESTIONS = [
  {
    category: 'Career / Placements',
    items: [
      'Mujhe placement ke liye kaunse skills sikhnay chahiye (mera background: ___)?',
      'Resume ko concise aur recruiter-friendly kaise banayein? (upload resume link)',
      'Interview ke liye 30-day study plan batao for [role].'
    ]
  },
  {
    category: 'Projects / Portfolios',
    items: [
      'Konsa side project mera portfolio strong karega for [role]?',
      'Mere project idea ko scale karne ke 3 practical steps batao.',
      'Project ke liye tech-stack choose karne mein help chahiye (details: ___).'
    ]
  },
  {
    category: 'Learning Path',
    items: [
      'Beginner se [skill] mein expert banne ka roadmap batao (6 months).',
      'Kaunse free resources follow karun for [topic]?',
      'Daily 1-hour study plan create karo for learning [topic].'
    ]
  },
  {
    category: 'Interview / Mock',
    items: [
      'Mere resume ke basis par common interview questions predict karo.',
      'Mock interview request: please ask 10 behavioral + 5 technical Qs.',
      'Technical question pe step-by-step solution chahiye (topic: ___).'
    ]
  },
  {
    category: 'Startup / Mentorship',
    items: [
      'Mera startup idea validate karne ke 5 quick steps batao.',
      'Pricing strategy suggest karo for an edtech SaaS targeting students.',
      'Mentorship plan: 3-month goal + weekly milestones for career pivot.'
    ]
  }
];

const SuggestedQuestions = ({ onSelect }) => {
  return (
    <div style={{ marginBottom: 16 }}>
      {SUGGESTIONS.map((grp) => (
        <div key={grp.category} style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: '#111', marginBottom: 8 }}>{grp.category}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {grp.items.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onSelect(q)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 20,
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#374151'
                }}
              >
                {q.length > 60 ? q.slice(0, 60) + '…' : q}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SuggestedQuestions;