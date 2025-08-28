// src/main.jsx (Updated Code)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom'; // Ise import karein

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>  {/* App ko isse wrap karein */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);