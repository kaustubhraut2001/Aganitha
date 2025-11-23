'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface LinkStats {
    id: number;
    code: string;
    targetUrl: string;
    clicks: number;
    lastClickedAt: string | null;
    createdAt: string;
}

export default function StatsPage() {
    const params = useParams();
    const code = params.code as string;

    const [link, setLink] = useState<LinkStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, [code]);

    const fetchStats = async () => {
        try {
            const response = await fetch(`/api/links/${code}`);

            if (!response.ok) {
                setError('Link not found');
                return;
            }

            const data = await response.json();
            setLink(data);
        } catch (err) {
            setError('Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Never';
        const d = new Date(date);
        return d.toLocaleString();
    };

    const getRelativeTime = (date: string | null) => {
        if (!date) return 'Never';
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    if (loading) {
        return (
            <div className="empty-state">
                <div className="loading" style={{ width: '40px', height: '40px' }}></div>
                <p>Loading stats...</p>
            </div>
        );
    }

    if (error || !link) {
        return (
            <div className="card">
                <div className="empty-state">
                    <div className="empty-state-icon">❌</div>
                    <div className="empty-state-title">Link Not Found</div>
                    <p className="text-secondary">
                        The short code "{code}" does not exist.
                    </p>
                    <Link href="/" className="btn btn-primary mt-3">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${link.code}`;

    return (
        <div>
            <div className="mb-3">
                <Link href="/" className="text-secondary" style={{ textDecoration: 'none' }}>
                    ← Back to Dashboard
                </Link>
            </div>

            <h1 className="mb-4">Link Statistics</h1>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{link.clicks}</div>
                    <div className="stat-label">Total Clicks</div>
                </div>
                <div className="stat-card" style={{ background: 'var(--gradient-secondary)' }}>
                    <div className="stat-value">{getRelativeTime(link.lastClickedAt)}</div>
                    <div className="stat-label">Last Clicked</div>
                </div>
            </div>

            {/* Link Details */}
            <div className="card mb-4">
                <div className="card-header">
                    <h2 className="card-title">Link Details</h2>
                </div>

                <div className="form-group">
                    <label className="form-label">Short Code</label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <code className="code" style={{ flex: 1, padding: 'var(--spacing-md)', fontSize: '1.1rem' }}>
                            {link.code}
                        </code>
                        <button
                            className="btn btn-secondary"
                            onClick={() => copyToClipboard(link.code)}
                        >
                            Copy
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Short URL</label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="text"
                            className="form-input"
                            value={shortUrl}
                            readOnly
                            style={{ flex: 1 }}
                        />
                        <button
                            className="btn btn-secondary"
                            onClick={() => copyToClipboard(shortUrl)}
                        >
                            Copy
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Target URL</label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <input
                            type="text"
                            className="form-input"
                            value={link.targetUrl}
                            readOnly
                            style={{ flex: 1 }}
                        />
                        <button
                            className="btn btn-secondary"
                            onClick={() => copyToClipboard(link.targetUrl)}
                        >
                            Copy
                        </button>
                    </div>
                </div>

                <div className="form-group mb-0">
                    <label className="form-label">Created</label>
                    <div className="text-secondary">
                        {formatDate(link.createdAt)}
                    </div>
                </div>
            </div>

            {/* Test Link */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Test Your Link</h2>
                </div>
                <p className="text-secondary mb-3">
                    Click the button below to test the redirect (will open in a new tab)
                </p>
                <a
                    href={`/${link.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                >
                    Test Redirect
                </a>
            </div>
        </div>
    );
}
