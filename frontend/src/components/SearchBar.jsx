// src/components/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/search/mentors?q=${query}`);
      const data = await response.json();
      setSuggestions(data);
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const startChatWithMentor = (mentor) => {
    navigate('/chat', { state: { selectedContact: mentor } });
  };

  const showNoResults = query.trim() && suggestions.length === 0;

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search for Mentor, skills, or topics..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          <li className="suggestions-header">Suggested Mentors:</li>
          {suggestions.map((mentor) => (
            <li key={mentor._id} onClick={() => startChatWithMentor(mentor)}>
              {mentor.username}
            </li>
          ))}
        </ul>
      )}

      {showNoResults && (
        <div className="no-results-msg">
          No Mentors found for “<b>{query}</b>”.
        </div>
      )}
    </div>
  );
};

export default SearchBar;
