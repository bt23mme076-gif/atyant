// src/components/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Don't search if the query is empty
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

    // This prevents sending an API request on every single keystroke.
    // It waits for 300ms after the user stops typing.
    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const startChatWithMentor = (mentor) => {
    navigate('/chat', { state: { selectedContact: mentor } });
  };

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search for mentors, skills, or topics..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          <li className="suggestions-header">Suggested Mentors:</li>
          {suggestions.map(mentor => (
            <li key={mentor._id} onClick={() => startChatWithMentor(mentor)}>
              {mentor.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;