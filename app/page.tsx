'use client';

import { useState, useEffect } from 'react';

interface Link {
  id: number;
  code: string;
  targetUrl: string;
  clicks: number;
  lastClickedAt: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetUrl, setTargetUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links');
      const data = await response.json();
      setLinks(data);
    } catch (err) {
      console.error('Error fetching links:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl,
          customCode: customCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create link');
        return;
      }

      setSuccess(`Link created! Short URL: ${window.location.origin}/${data.code}`);
      setTargetUrl('');
      setCustomCode('');
      fetchLinks();
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const response = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchLinks();
      } else {
        alert('Failed to delete link');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const filteredLinks = links.filter(
    (link) =>
      link.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.targetUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  return (
    <div>
      <h1 className="mb-4">URL Shortener Dashboard</h1>

      {/* Add Link Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h2 className="card-title">Create Short Link</h2>
        </div>

        {success && (
          <div className="success-message">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="targetUrl" className="form-label">
              Target URL *
            </label>
            <input
              id="targetUrl"
              type="url"
              className={`form-input ${error && !targetUrl ? 'error' : ''}`}
              placeholder="https://example.com/very/long/url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customCode" className="form-label">
              Custom Code (optional)
            </label>
            <input
              id="customCode"
              type="text"
              className={`form-input ${error && customCode ? 'error' : ''}`}
              placeholder="mycode (6-8 alphanumeric characters)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              pattern="[A-Za-z0-9]{6,8}"
              maxLength={8}
            />
            <small className="text-secondary">
              Leave empty to generate a random code
            </small>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <span className="loading"></span>
                Creating...
              </>
            ) : (
              '⚡ Create Short Link'
            )}
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="card mb-4">
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search by code or URL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Links Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Your Links ({filteredLinks.length})</h2>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loading" style={{ width: '40px', height: '40px' }}></div>
            <p>Loading links...</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔗</div>
            <div className="empty-state-title">No links found</div>
            <p className="text-secondary">
              {searchQuery
                ? 'Try a different search query'
                : 'Create your first short link above!'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Short Code</th>
                  <th>Target URL</th>
                  <th>Clicks</th>
                  <th>Last Clicked</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link) => (
                  <tr key={link.id}>
                    <td>
                      <code className="code">{link.code}</code>
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '300px' }}>
                        {link.targetUrl}
                      </div>
                    </td>
                    <td>
                      <strong>{link.clicks}</strong>
                    </td>
                    <td className="text-secondary">
                      {formatDate(link.lastClickedAt)}
                    </td>
                    <td className="text-secondary">
                      {formatDate(link.createdAt)}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() =>
                            copyToClipboard(`${window.location.origin}/${link.code}`)
                          }
                          title="Copy short URL"
                        >
                          📋
                        </button>
                        <a
                          href={`/code/${link.code}`}
                          className="btn btn-secondary btn-sm"
                          title="View stats"
                        >
                          📊
                        </a>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(link.code)}
                          title="Delete link"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
