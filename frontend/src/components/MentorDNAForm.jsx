import React, { useState, useEffect } from 'react';
import { mentorApi } from '../services/api';
import { Stepper, Step, StepLabel, Button, Typography, Box, TextField, FormControlLabel, Checkbox, Card, CardContent, Divider } from '@mui/material';
import './MentorDNAForm.css';

const steps = [
  'Tone',
  'Language',
  'Hard Truth',
  'Time Waste',
  'Roadmap',
  'Resume Tip',
  'Never Recommend',
  'Permission'
];

const initialStrategy = {
  tone: '',
  language: '',
  hardTruth: '',
  timeWaste: '',
  roadmap: '',
  resumeTip: '',
  neverRecommend: '',
  permission: false
};

export default function MentorDNAForm({ strategy, onSuccess }) {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(strategy || initialStrategy);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Sync form with strategy prop when it changes
  useEffect(() => {
    if (strategy) {
      setForm(strategy);
    }
  }, [strategy]);

  // Autosave draft on form change
  useEffect(() => {
    const timeout = setTimeout(() => {
      mentorApi.saveDraft({ ...form }); // lightweight endpoint, must exist in backend
    }, 800);
    return () => clearTimeout(timeout);
  }, [form]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        // Final submit: send full form, mark as completed
        await mentorApi.updateStrategy({ ...form, isDraft: false, completedAt: new Date() });
        setSuccess('Strategy saved! Now we can handle your pending questions.');
        if (onSuccess) onSuccess({ ...form, isDraft: false, completedAt: new Date() });
      } catch (err) {
        setError(err.message || 'Failed to save strategy.');
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <TextField
            key="tone-field"
            label="Tone"
            name="tone"
            value={form.tone}
            onChange={handleChange}
            fullWidth
            autoComplete="off"
            className="mentor-dna-input"
            placeholder="How do you usually talk to juniors? 
(e.g. Straightforward but kind, strict & honest, friendly big-brother style, blunt but practical. 
If a junior is confused, how would your message FEEL?)"
            helperText="Atyant Engine will use this to define your mentor persona. Be as raw and honest as possible."

            multiline
            minRows={2}
          />
        );
      case 1:
        return (
          <TextField
            key="language-field"
            label="Language"
            name="language"
            value={form.language}
            onChange={handleChange}
            fullWidth
            autoComplete="off"
            className="mentor-dna-input"
            placeholder="Which language style should we use while answering on your behalf?
(e.g. Pure English, Hinglish preferred, simple Hindi + English mix, very simple words, or technical when needed)"
            helperText="Atyant Engine will use this to define your mentor persona. Be as raw and honest as possible."
            multiline
            minRows={2}
          />
        );
      case 2:
        return (
          <TextField
            key="hardTruth-field"
            label="Hard Truth"
            name="hardTruth"
            value={form.hardTruth}
            onChange={handleChange}
            fullWidth
            autoComplete="off"
            className="mentor-dna-input"
            placeholder="What harsh but true things do you ALWAYS tell students?
(e.g. 'You are not late, but you are lazy', 'No DSA = no product company', 
'Tier-3 means extra effort', 'Most people quit too early')"
            helperText="Atyant Engine will use this to define your mentor persona. Be as raw and honest as possible."
            multiline
            minRows={2}
          />
        );
      case 3:
        return (
          <TextField
            key="timeWaste-field"
            label="Time Waste"
            name="timeWaste"
            value={form.timeWaste}
            onChange={handleChange}
            fullWidth
            autoComplete="off"
            className="mentor-dna-input"
placeholder="What common mistakes or time-wasting things should juniors avoid?
(e.g. Running behind too many tools, fake internships, copying projects, 
watching motivation instead of working)"
            helperText="Atyant Engine will use this to define your mentor persona. Be as raw and honest as possible."

            multiline
            minRows={2}
          />
        );
      case 4:
        return (
          <TextField
            key="roadmap-field"
            label="Roadmap"
            name="roadmap"
            value={form.roadmap}
            onChange={handleChange}
            fullWidth
            autoComplete="off"
            className="mentor-dna-input"
placeholder="Your ideal step-by-step path for a serious student.
Write like advice to your younger self.
(e.g. Month 1–2: Basics + DSA, Month 3–4: Projects, Month 5: Resume + referrals, Month 6: Apply daily)"
            helperText="Atyant Engine will use this to define your mentor persona. Be as raw and honest as possible."
            multiline
            minRows={3}
          />
        );
      case 5:
        return (
          <TextField
            key="resumeTip-field"
            label="Resume Tip"
            name="resumeTip"
            value={form.resumeTip}
            onChange={handleChange}
            fullWidth
            autoComplete="off"
            className="mentor-dna-input"
placeholder="What 2–3 resume rules you NEVER compromise on?
(e.g. 1-page only, numbers & impact, no fake skills, clean formatting, real links)"
            helperText="Atyant Engine will use this to define your mentor persona. Be as raw and honest as possible."
            multiline
            minRows={2}
          />
        );
      case 6:
        return (
          <TextField
            key="neverRecommend-field"
            label="Never Recommend"
            name="neverRecommend"
            value={form.neverRecommend}
            onChange={handleChange}
            fullWidth
            autoComplete="off"
            className="mentor-dna-input"
placeholder="What practices you strongly oppose and will never suggest?
(e.g. Paid referrals, fake certificates, exaggerating skills, copy-paste answers)"
            helperText="Atyant Engine will use this to define your mentor persona. Be as raw and honest as possible."
            multiline
            minRows={2}
          />
        );
      case 7:
        return (
          <div className="mentor-dna-permission">
            <FormControlLabel control={<Checkbox name="permission" checked={form.permission} onChange={handleChange} />} label="I give permission to use my mentoring style for answering juniors." />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mentor-dna-form-outer mentor-dna-bg">
      <div className="mentor-dna-form-card mentor-dna-glass">
        <div className="mentor-dna-form-content">
          <h2 className="mentor-dna-title">Help us answer juniors even when you're sleeping.</h2>
          <h4 className="mentor-dna-subtitle">Fill your mentoring style once.</h4>
          <div className="mentor-dna-divider" />
          {/* Step progress psychology hack */}
          <Typography variant="caption" align="center" style={{ display: 'block', marginBottom: 8 }}>
            Step {activeStep + 1} of {steps.length} · ~{steps.length - activeStep} min need to complete
          </Typography>
          <div className="mentor-dna-stepper">
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <div key={activeStep} className="mentor-dna-step-content">{getStepContent(activeStep)}</div>
          {error && <div className="mentor-dna-error">{error}</div>}
          {success && <div className="mentor-dna-success">{success}</div>}
          <div className="mentor-dna-btn-row">
            <Button disabled={activeStep === 0 || loading} onClick={handleBack} className="mentor-dna-btn mentor-dna-btn-back">
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading || (activeStep === steps.length - 1 && !form.permission)}
              className="mentor-dna-btn mentor-dna-btn-next"
            >
              {activeStep === steps.length - 1 ? (loading ? 'Submitting...' : 'Submit') : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
