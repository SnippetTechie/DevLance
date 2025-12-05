import { Routes, Route } from 'react-router-dom'; // ✅ Only import Routes and Route
import { WalletProvider } from './context/WalletContext';
import { ToastProvider } from './context/ToastContext';

// Pages
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import JobDetails from './pages/JobDetails';
import CreateGig from './pages/CreateGig';
import Dashboard from './pages/Dashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <WalletProvider>
      <ToastProvider>
        {/* ✅ No Router here - it's already in main.jsx */}
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/job/:jobId" element={<JobDetails />} />
          <Route path="/create-gig" element={<CreateGig />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/freelancer" element={<FreelancerDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </WalletProvider>
  );
}

export default App;