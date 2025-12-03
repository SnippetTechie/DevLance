import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

const Landing = React.lazy(() => import('./pages/Landing'));
const ClientDashboard = React.lazy(() => import('./pages/ClientDashboard'));
const CreateGig = React.lazy(() => import('./pages/CreateGig'));
const Marketplace = React.lazy(() => import('./pages/Marketplace'));

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
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/create-gig" element={<CreateGig />} />
            <Route path="/marketplace" element={<Marketplace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

