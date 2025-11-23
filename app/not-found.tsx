import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="card">
            <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <div className="empty-state-title">404 - Page Not Found</div>
                <p className="text-secondary mb-3">
                    The page or short link you're looking for doesn't exist.
                </p>
                <Link href="/" className="btn btn-primary">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
