import React, { useState } from 'react';
import Papa from 'papaparse';


export default function RagChatTester({ endpoint = 'http://localhost:8000/api/chat' }) {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]); // { role, text }
  const [loading, setLoading] = useState(false);

  /* ---------------- Upload & parse CSV ---------------- */
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => setRows(data),
      error: () => alert('Failed to parse file'),
    });
  };

  /* ---------------- Ask question --------------------- */
  const askQuestion = async () => {
    if (!question.trim()) return;

    if (!endpoint) {
      alert('No backend endpoint configured!');
      return;
    }
    if (!rows.length) {
      alert('Please upload a CSV file first.');
      return;
    }

    setMessages((m) => [...m, { role: 'user', text: question }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, data: rows }),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const { answer } = await res.json();
      setMessages((m) => [...m, { role: 'assistant', text: answer }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { role: 'assistant', text: '❌ Cannot reach backend' }]);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------- UI -------------------- */
  const baseFont = {
    fontFamily: 'system-ui, sans-serif',
    fontSize: '1.1rem',
    lineHeight: 1.4,
    color: '#222',
  };

  return (
    <div
      style={{
        ...baseFont,
        display: 'flex',
        gap: '2rem',
        padding: 32,
        width: '100vw',
        height: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {/* Upload column */}
      <div style={{ flex: 1, minWidth: 0 }}> {/* allow flex shrink */}
        <h2 style={{ fontSize: '1.35rem' }}>1. Upload CSV</h2>
        <input type="file" accept=".csv" onChange={handleUpload} />
        {fileName && <p style={{ marginTop: 6 }}>Loaded: {fileName}</p>}

        {rows.length > 0 && (
          <div
            style={{
              border: '1px solid #ddd',
              height: '50vh',
              overflow: 'auto',
              marginTop: 16,
              borderRadius: 4,
            }}
          >
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  {Object.keys(rows[0]).map((col) => (
                    <th
                      key={col}
                      style={{
                        border: '1px solid #eee',
                        padding: 6,
                        background: '#fafafa',
                        position: 'sticky',
                        top: 0,
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 15).map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((cell, i) => (
                      <td key={i} style={{ border: '1px solid #eee', padding: 6 }}>
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chat column */}
      <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <h2 style={{ fontSize: '1.35rem' }}>2. Chat</h2>
        <div
          style={{
            flex: 1,
            border: '1px solid #ddd',
            padding: 16,
            overflowY: 'auto',
            borderRadius: 4,
            background: '#f8f9fa',
          }}
        >
          {messages.map((m, i) => (
            <p
              key={i}
              style={{
                background: m.role === 'user' ? '#d0ebff' : '#e9ecef',
                padding: 10,
                borderRadius: 8,
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                margin: '6px 0',
              }}
            >
              {m.text}
            </p>
          ))}
          {loading && <p style={{ color: '#666' }}>Generating answer…</p>}
        </div>

        <textarea
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question..."
          style={{ marginTop: 12, padding: 10, fontSize: '1rem' }}
        />
        <button
          onClick={askQuestion}
          disabled={loading}
          style={{ alignSelf: 'flex-end', marginTop: 8, padding: '8px 16px', fontSize: '1rem' }}
        >
          Ask
        </button>
      </div>
    </div>
  );
}
