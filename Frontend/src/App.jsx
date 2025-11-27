// src/App.jsx
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import './index.css';

// Lazy load pages (only Landing exists for now)
const Landing = React.lazy(() => import('./pages/Landing'));
const CreateGig = React.lazy(() => import('./pages/CreateGig'));       // placeholder
const Marketplace = React.lazy(() => import('./pages/Marketplace'));   // placeholder
const NotFound = React.lazy(() => import('./pages/NotFound'));         // placeholder

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header shown on all pages */}
      <Header />

      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/create-gig" element={<CreateGig />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* Optional footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} DevLance
      </footer>
    </div>
  );
}
