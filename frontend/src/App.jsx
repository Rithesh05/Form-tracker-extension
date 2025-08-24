// FILE: src/App.js

import React, { useState, useEffect, useMemo } from 'react';
// Make sure to import the CSS file
import './App.css';

// --- Icon Components ---
// These are simple SVG components for the UI icons.
const SearchIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const MailIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line>
  </svg>
);

// --- Reusable Components ---

// Card component for a single log entry.
const LogCard = ({ log }) => {
  const formattedDate = useMemo(() => {
    if (!log.timestamp) return 'No date provided';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(log.timestamp).toLocaleDateString('en-US', options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  }, [log.timestamp]);

  return (
    <div className="log-card">
      <h3 className="log-card-title" title={log.title}>
        {log.title || 'Untitled'}
      </h3>
      <div className="log-card-details">
        <div className="log-card-detail-item">
          <MailIcon className="log-card-icon" />
          <span title={log.gmail}>{log.gmail || 'No email provided'}</span>
        </div>
        <div className="log-card-detail-item">
          <CalendarIcon className="log-card-icon" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

// Loading spinner component.
const LoadingSpinner = () => (
  <div className="loading-spinner-container">
    <div className="loading-spinner"></div>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [allLogs, setAllLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the API when the component mounts.
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const apiUrl = 'https://chrome-extension-of-forms.onrender.com/logs';
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setAllLogs(sortedData);
      } catch (e) {
        console.error("Failed to fetch logs:", e);
        setError('Could not load data. Please check your connection or try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Filter logs based on the search term.
  const filteredLogs = useMemo(() => {
    if (!searchTerm) {
      return allLogs;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return allLogs.filter(log =>
      log.title && log.title.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm, allLogs]);

  // Decide what content to render based on the current state.
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <p className="error-message">{error}</p>;
    }
    if (filteredLogs.length === 0) {
      return <p className="info-message">No records found.</p>;
    }
    return (
      <div className="logs-grid">
        {filteredLogs.map((log) => (
          <LogCard key={log._id} log={log} />
        ))}
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="dashboard">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Form Submission Logs</h1>
          <p className="dashboard-subtitle">A dashboard to view and search records.</p>
        </header>

        <div className="search-bar-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon-wrapper">
              <SearchIcon className="search-icon" />
            </div>
          </div>
        </div>

        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
