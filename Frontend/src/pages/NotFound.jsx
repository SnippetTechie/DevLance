// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950">
      
      <Header />

      <main className="relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Display */}
          <div className="relative mb-8">
            <h1 className="text-[150px] sm:text-[200px] font-bold text-white/5 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-3xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button variant="primary" size="lg">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="secondary" size="lg">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Jobs
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-gray-500 mb-4">Quick Links</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/marketplace" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Marketplace
              </Link>
              <span className="text-gray-700">•</span>
              <Link to="/dashboard" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Dashboard
              </Link>
              <span className="text-gray-700">•</span>
              <Link to="/create-gig" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Create Gig
              </Link>
              <span className="text-gray-700">•</span>
              <Link to="/freelancer" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Freelancer
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}