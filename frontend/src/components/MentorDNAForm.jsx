import React, { useState, useEffect } from 'react';
import { mentorApi } from '../services/api';
import { 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography, 
  FormControlLabel, 
  Checkbox, 
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormGroup,
  Chip,
  Box
} from '@mui/material';
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
  hardTruth: [],
  timeWaste: [],
  roadmap: [],
  resumeTip: [],
  neverRecommend: [],
  permission: false
};

// Predefined options for each field
const OPTIONS = {
  tone: [
    { value: 'straightforward', label: 'Straightforward but kind' },
    { value: 'strict', label: 'Strict & honest' },
    { value: 'friendly', label: 'Friendly big-brother style' },
    { value: 'blunt', label: 'Blunt but practical' }
  ],
  language: [
    { value: 'english', label: 'Pure English' },
    { value: 'hinglish', label: 'Hinglish (Hindi + English mix)' },
    { value: 'simple', label: 'Very simple words' }
  ],
  hardTruth: [
    'You are not late, but you are lazy',
    'No DSA = no product company',
    'Tier-3 means extra effort, not excuses',
    'Most people quit too early',
    'Talent without discipline is wasted',
    'Your background doesn\'t define your future'
  ],
  timeWaste: [
    'Running behind too many tools/frameworks',
    'Fake internships and certificates',
    'Copy-pasting projects without understanding',
    'Watching motivation videos instead of working',
    'Tutorial hell - watching without building',
    'Chasing shortcuts instead of fundamentals'
  ],
  roadmap: [
    'Month 1-2: Master basics + Start DSA',
    'Month 3-4: Build 2-3 real projects',
    'Month 5: Polish resume + get referrals',
    'Month 6: Apply daily + practice interviews',
    'Focus on one tech stack deeply',
    'Build in public, share your journey'
  ],
  resumeTip: [
    '1-page only, no exceptions',
    'Numbers & measurable impact in every point',
    'No fake skills or inflated experience',
    'Clean formatting, professional look',
    'Real project links (GitHub/live)',
    'Tailored for each job application'
  ],
  neverRecommend: [
    'Paid referrals or fake references',
    'Fake certificates or bootcamp claims',
    'Exaggerating skills you don\'t have',
    'Copy-paste answers without understanding',
    'Resume lies or project theft',
    'Shortcuts that damage credibility'
  ]
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
      mentorApi.saveDraft({ ...form });
    }, 800);
    return () => clearTimeout(timeout);
  }, [form]);

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (fieldName, value) => {
    setForm(prev => {
      const currentValues = prev[fieldName] || [];
      const isSelected = currentValues.includes(value);
      
      return {
        ...prev,
        [fieldName]: isSelected 
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      };
    });
  };

  const handlePermissionChange = (e) => {
    setForm(prev => ({
      ...prev,
      permission: e.target.checked
    }));
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
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
      case 0: // Tone
        return (
          <FormControl component="fieldset" fullWidth className="mentor-dna-form-control">
            <FormLabel component="legend" className="mentor-dna-label">
              How do you usually talk to juniors?
            </FormLabel>
            <RadioGroup
              name="tone"
              value={form.tone}
              onChange={handleRadioChange}
              className="mentor-dna-radio-group"
            >
              {OPTIONS.tone.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  className="mentor-dna-radio-option"
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 1: // Language
        return (
          <FormControl component="fieldset" fullWidth className="mentor-dna-form-control">
            <FormLabel component="legend" className="mentor-dna-label">
              Which language style should we use while answering on your behalf?
            </FormLabel>
            <RadioGroup
              name="language"
              value={form.language}
              onChange={handleRadioChange}
              className="mentor-dna-radio-group"
            >
              {OPTIONS.language.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  className="mentor-dna-radio-option"
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 2: // Hard Truth
        return (
          <FormControl component="fieldset" fullWidth className="mentor-dna-form-control">
            <FormLabel component="legend" className="mentor-dna-label">
              What harsh but true things do you ALWAYS tell students? (Select all that apply)
            </FormLabel>
            <FormGroup className="mentor-dna-checkbox-group">
              {OPTIONS.hardTruth.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={(form.hardTruth || []).includes(option)}
                      onChange={() => handleCheckboxChange('hardTruth', option)}
                    />
                  }
                  label={option}
                  className="mentor-dna-checkbox-option"
                />
              ))}
            </FormGroup>
          </FormControl>
        );

      case 3: // Time Waste
        return (
          <FormControl component="fieldset" fullWidth className="mentor-dna-form-control">
            <FormLabel component="legend" className="mentor-dna-label">
              What common time-wasting mistakes should juniors avoid? (Select all that apply)
            </FormLabel>
            <FormGroup className="mentor-dna-checkbox-group">
              {OPTIONS.timeWaste.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={(form.timeWaste || []).includes(option)}
                      onChange={() => handleCheckboxChange('timeWaste', option)}
                    />
                  }
                  label={option}
                  className="mentor-dna-checkbox-option"
                />
              ))}
            </FormGroup>
          </FormControl>
        );

      case 4: // Roadmap
        return (
          <FormControl component="fieldset" fullWidth className="mentor-dna-form-control">
            <FormLabel component="legend" className="mentor-dna-label">
              Your ideal step-by-step path for a serious student (Select all that apply)
            </FormLabel>
            <FormGroup className="mentor-dna-checkbox-group">
              {OPTIONS.roadmap.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={(form.roadmap || []).includes(option)}
                      onChange={() => handleCheckboxChange('roadmap', option)}
                    />
                  }
                  label={option}
                  className="mentor-dna-checkbox-option"
                />
              ))}
            </FormGroup>
          </FormControl>
        );

      case 5: // Resume Tip
        return (
          <FormControl component="fieldset" fullWidth className="mentor-dna-form-control">
            <FormLabel component="legend" className="mentor-dna-label">
              What resume rules you NEVER compromise on? (Select all that apply)
            </FormLabel>
            <FormGroup className="mentor-dna-checkbox-group">
              {OPTIONS.resumeTip.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={(form.resumeTip || []).includes(option)}
                      onChange={() => handleCheckboxChange('resumeTip', option)}
                    />
                  }
                  label={option}
                  className="mentor-dna-checkbox-option"
                />
              ))}
            </FormGroup>
          </FormControl>
        );

      case 6: // Never Recommend
        return (
          <FormControl component="fieldset" fullWidth className="mentor-dna-form-control">
            <FormLabel component="legend" className="mentor-dna-label">
              What practices you strongly oppose and will never suggest? (Select all that apply)
            </FormLabel>
            <FormGroup className="mentor-dna-checkbox-group">
              {OPTIONS.neverRecommend.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={(form.neverRecommend || []).includes(option)}
                      onChange={() => handleCheckboxChange('neverRecommend', option)}
                    />
                  }
                  label={option}
                  className="mentor-dna-checkbox-option"
                />
              ))}
            </FormGroup>
          </FormControl>
        );

      case 7: // Permission
        return (
          <div className="mentor-dna-permission">
            <FormControlLabel
              control={
                <Checkbox
                  name="permission"
                  checked={form.permission}
                  onChange={handlePermissionChange}
                />
              }
              label="I give permission to use my mentoring style for answering juniors."
            />
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
          
          <Typography variant="caption" align="center" style={{ display: 'block', marginBottom: 8 }}>
            Step {activeStep + 1} of {steps.length} · ~{steps.length - activeStep} min to complete
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

          <div key={activeStep} className="mentor-dna-step-content">
            {getStepContent(activeStep)}
          </div>

          {error && <div className="mentor-dna-error">{error}</div>}
          {success && <div className="mentor-dna-success">{success}</div>}

          <div className="mentor-dna-btn-row">
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              className="mentor-dna-btn mentor-dna-btn-back"
            >
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