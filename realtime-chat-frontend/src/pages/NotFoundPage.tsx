import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary p-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-accent mb-4">404</h1>
                <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};
