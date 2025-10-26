import React, { useState, useEffect } from 'react';
import BookkeeperDocumentView from './BookkeeperDocumentView';
import ClientDocumentsView from './ClientDocumentsView';
import './App.css';

const API_URL = "http://localhost:5000/api";

function App() {
  const [view, setView] = useState('bookkeeper');
  const [selectedClientId, setSelectedClientId] = useState(1);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/clients`);
      const data = await response.json();
      setClients(data);
      if (data.length > 0) {
        setSelectedClientId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.125rem',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav style={{
        padding: '1rem 2rem',
        background: '#1f2937',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          marginRight: 'auto'
        }}>
          📊 BIR Document Manager
        </div>

        <button
          onClick={() => setView('bookkeeper')}
          style={{
            padding: '0.5rem 1.25rem',
            background: view === 'bookkeeper' ? '#3b82f6' : '#4b5563',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
            boxShadow: view === 'bookkeeper' ? '0 0 0 3px rgba(59, 130, 246, 0.3)' : 'none'
          }}
        >
          👨‍💼 Bookkeeper View
        </button>

        <button
          onClick={() => setView('client')}
          style={{
            padding: '0.5rem 1.25rem',
            background: view === 'client' ? '#3b82f6' : '#4b5563',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
            boxShadow: view === 'client' ? '0 0 0 3px rgba(59, 130, 246, 0.3)' : 'none'
          }}
        >
          👤 Client View
        </button>

        {view === 'client' && clients.length > 0 && (
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(Number(e.target.value))}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              fontSize: '0.875rem',
              cursor: 'pointer',
              backgroundColor: 'white',
              color: '#374151'
            }}
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        )}
      </nav>

      {/* Main Content */}
      <div style={{ minHeight: 'calc(100vh - 65px)', backgroundColor: '#f9fafb' }}>
        {view === 'bookkeeper' ? (
          <BookkeeperDocumentView />
        ) : (
          <ClientDocumentsView clientId={selectedClientId} />
        )}
      </div>
    </div>
  );
}

export default App;