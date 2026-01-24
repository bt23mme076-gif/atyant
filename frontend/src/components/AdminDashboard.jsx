import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [experienceForm, setExperienceForm] = useState({
    background: '',
    stepsTaken: '',
    mistakes: '',
    advice: ''
  });

  useEffect(() => {
    fetchPendingQuestions();
  }, []);

  const fetchPendingQuestions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/pending-questions`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      const data = await res.json();
      if (data.success) setQuestions(data.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openQuestion = async (q) => {
    setSelectedQuestion(q);
    setExperienceForm({
      background: '',
      stepsTaken: '',
      mistakes: '',
      advice: ''
    });

    try {
      const res = await fetch(`${API_URL}/api/mentor/mentors/${q.matchedMentorId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      const data = await res.json();
      setMentor(data);
    } catch (err) {
      console.error('Failed to load mentor');
    }
  };

  const submitMentorExperience = async () => {
    if (!selectedQuestion || !mentor) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/mentor-experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          mentorId: mentor.id,
          experience: experienceForm
        })
      });

      if (res.ok) {
        alert('✅ Mentor experience saved');
        setSelectedQuestion(null);
        setMentor(null);
        fetchPendingQuestions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* LEFT: QUESTIONS */}
      <div className="w-1/3 border-r bg-white">
        <div className="p-4 font-bold text-lg border-b">
          Pending Questions
        </div>

        {loading ? (
          <div className="p-4 text-gray-400">Loading...</div>
        ) : (
          questions.map(q => (
            <div
              key={q.id}
              onClick={() => openQuestion(q)}
              className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                selectedQuestion?.id === q.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-medium text-sm">{q.text}</div>
              <div className="text-xs text-gray-500 mt-1">
                Match: {q.matchConfidence}%
              </div>
            </div>
          ))
        )}
      </div>

      {/* RIGHT: DETAILS */}
      <div className="flex-1 p-6 overflow-y-auto">

        {!selectedQuestion ? (
          <div className="text-gray-400 text-center mt-20">
            Select a question to continue
          </div>
        ) : (
          <>
            {/* QUESTION */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-2">User Question</h2>
              <div className="p-4 bg-white border rounded">
                {selectedQuestion.text}
              </div>
            </div>

            {/* MENTOR */}
            {mentor && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-2">Matched Mentor</h2>
                <div className="p-4 bg-white border rounded">
                  <div className="font-semibold">{mentor.name}</div>
                  <div className="text-sm text-gray-600">{mentor.background}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Match Confidence: {selectedQuestion.matchConfidence}%
                  </div>
                </div>
              </div>
            )}

            {/* EXPERIENCE FORM */}
            <div className="bg-white border rounded p-4 space-y-4">
              <h2 className="text-lg font-bold">Mentor Experience</h2>

              <textarea
                placeholder="Mentor background at that time"
                className="w-full border p-2 rounded"
                value={experienceForm.background}
                onChange={e =>
                  setExperienceForm({ ...experienceForm, background: e.target.value })
                }
              />

              <textarea
                placeholder="Exact steps mentor followed"
                className="w-full border p-2 rounded"
                value={experienceForm.stepsTaken}
                onChange={e =>
                  setExperienceForm({ ...experienceForm, stepsTaken: e.target.value })
                }
              />

              <textarea
                placeholder="Mistakes mentor made"
                className="w-full border p-2 rounded"
                value={experienceForm.mistakes}
                onChange={e =>
                  setExperienceForm({ ...experienceForm, mistakes: e.target.value })
                }
              />

              <textarea
                placeholder="Advice to junior"
                className="w-full border p-2 rounded"
                value={experienceForm.advice}
                onChange={e =>
                  setExperienceForm({ ...experienceForm, advice: e.target.value })
                }
              />

              <button
                onClick={submitMentorExperience}
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                {submitting ? 'Saving...' : 'Save Mentor Experience'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
