import React, { useState } from 'react';
import { Wallet, Shield, Code, Plus, Clock, CheckCircle, AlertCircle, Send, ExternalLink, FileText, DollarSign, User, Briefcase, X, Menu, ChevronLeft } from 'lucide-react';

export default function DevLance() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [userType, setUserType] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Job creation state
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    skills: ''
  });
  
  // Mock jobs data
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Build React Dashboard',
      description: 'Need a modern analytics dashboard with charts and real-time updates',
      budget: '0.5',
      status: 'open',
      client: '0x742d...4b9a',
      skills: 'React, TypeScript, D3.js',
      deadline: '2024-12-15'
    },
    {
      id: 2,
      title: 'Smart Contract Audit',
      description: 'Security audit for DeFi protocol smart contracts',
      budget: '1.2',
      status: 'open',
      client: '0x8c3f...2e1d',
      skills: 'Solidity, Security, Testing',
      deadline: '2024-12-20'
    }
  ]);

  const [activeJob, setActiveJob] = useState(null);
  const [submissionText, setSubmissionText] = useState('');

  const connectWallet = () => {
    const mockAddress = '0x' + Math.random().toString(16).substr(2, 4) + '...' + Math.random().toString(16).substr(2, 4);
    setWalletAddress(mockAddress);
    setWalletConnected(true);
  };

  const handleJobCreate = () => {
    const newJob = {
      id: jobs.length + 1,
      ...jobForm,
      status: 'open',
      client: walletAddress,
    };
    setJobs([...jobs, newJob]);
    setCurrentPage('marketplace');
    setJobForm({ title: '', description: '', budget: '', deadline: '', skills: '' });
  };

  const acceptJob = (job) => {
    setActiveJob(job);
    setCurrentPage('task-completion');
  };

  const submitWork = () => {
    setActiveJob({ ...activeJob, status: 'completed' });
    alert('Work submitted! Payment will be released upon client approval.');
    setCurrentPage('marketplace');
    setSubmissionText('');
  };

  // Render Landing Page
  const renderLanding = () => (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-8">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Trustless • Decentralized • Secure</span>
          </div>
          
          <h1 className="text-6xl sm:text-7xl font-bold mb-6 leading-tight">
            Welcome to
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              DevLance
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Smart contract-powered freelancing. Connect, collaborate, and get paid securely on the blockchain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <button
            onClick={() => {
              setUserType('client');
              setCurrentPage('create-job');
            }}
            className="group bg-slate-900/50 backdrop-blur border-2 border-slate-800 hover:border-blue-500 rounded-3xl p-10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
              <Briefcase className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">I'm a Client</h2>
            <p className="text-slate-400 mb-6">Post projects and hire talented developers with secure escrow payments</p>
            <div className="flex items-center justify-center space-x-2 text-blue-400 font-semibold">
              <span>Create a Job</span>
              <ChevronLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => {
              setUserType('developer');
              setCurrentPage('marketplace');
            }}
            className="group bg-slate-900/50 backdrop-blur border-2 border-slate-800 hover:border-purple-500 rounded-3xl p-10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
              <Code className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">I'm a Developer</h2>
            <p className="text-slate-400 mb-6">Browse opportunities and earn ETH by delivering quality work</p>
            <div className="flex items-center justify-center space-x-2 text-purple-400 font-semibold">
              <span>Find Projects</span>
              <ChevronLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-400">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Smart Contract Escrow</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-purple-400" />
              <span>Web3 Authentication</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-pink-400" />
              <span>IPFS Storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Create Job Page
  const renderCreateJob = () => (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setCurrentPage('landing')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white mb-8 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Create a Job</h1>
          <p className="text-xl text-slate-400">Post your project and lock ETH in escrow</p>
        </div>

        {!walletConnected ? (
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-slate-400 mb-8">Connect your Ethereum wallet to create jobs and manage escrow</p>
            <button
              onClick={connectWallet}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-slate-400">Connected Wallet</div>
                  <div className="font-mono font-semibold">{walletAddress}</div>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Job Title</label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                  placeholder="e.g., Build a DeFi Dashboard"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  required
                  value={jobForm.description}
                  onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                  placeholder="Describe your project requirements..."
                  rows="5"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Budget (ETH)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={jobForm.budget}
                      onChange={(e) => setJobForm({...jobForm, budget: e.target.value})}
                      placeholder="0.5"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 transition"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">ETH</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Deadline</label>
                  <input
                    type="date"
                    required
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({...jobForm, deadline: e.target.value})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Required Skills</label>
                <input
                  type="text"
                  required
                  value={jobForm.skills}
                  onChange={(e) => setJobForm({...jobForm, skills: e.target.value})}
                  placeholder="e.g., React, Solidity, Web3.js"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <strong className="text-blue-400">Escrow Protection:</strong> Your ETH will be locked in a smart contract and only released when you approve the developer's work.
                  </div>
                </div>
              </div>

              <button
                onClick={handleJobCreate}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Job & Lock ETH</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render Marketplace
  const renderMarketplace = () => (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <button
              onClick={() => setCurrentPage('landing')}
              className="flex items-center space-x-2 text-slate-400 hover:text-white mb-4 transition"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-5xl font-bold mb-2">Available Jobs</h1>
            <p className="text-xl text-slate-400">Browse opportunities and start earning</p>
          </div>
          {userType === 'client' && walletConnected && (
            <button
              onClick={() => setCurrentPage('create-job')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Job</span>
            </button>
          )}
        </div>

        {!walletConnected && userType === 'developer' && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <div className="font-semibold text-yellow-400 mb-1">Wallet Required</div>
                <div className="text-sm text-slate-300 mb-4">Connect your wallet to accept jobs and receive payments</div>
                <button
                  onClick={connectWallet}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-all"
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{job.title}</h3>
                  <p className="text-slate-400 mb-4">{job.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.split(',').map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm text-blue-300">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span className="font-bold text-xl">{job.budget} ETH</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-mono">{job.client}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{job.deadline}</span>
                  </div>
                </div>

                {userType === 'developer' && walletConnected && (
                  <button
                    onClick={() => acceptJob(job)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                  >
                    Accept Job
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Task Completion Page
  const renderTaskCompletion = () => (
    <div className="min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setCurrentPage('marketplace')}
          className="flex items-center space-x-2 text-slate-400 hover:text-white mb-8 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Jobs</span>
        </button>

        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Task Completion</h1>
          <p className="text-xl text-slate-400">Submit your work and receive payment</p>
        </div>

        {activeJob && (
          <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{activeJob.title}</h2>
                <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
                  <span className="text-green-400 font-semibold">In Progress</span>
                </div>
              </div>
              <p className="text-slate-400 mb-6">{activeJob.description}</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-sm text-slate-400 mb-1">Budget</div>
                  <div className="text-xl font-bold text-green-400">{activeJob.budget} ETH</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-sm text-slate-400 mb-1">Client</div>
                  <div className="font-mono text-sm">{activeJob.client}</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-sm text-slate-400 mb-1">Deadline</div>
                  <div className="font-semibold">{activeJob.deadline}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-4">Submit Your Work</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Submission Details</label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Describe what you've delivered, include links to GitHub repo, deployed site, or IPFS hash..."
                    rows="6"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition resize-none"
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div className="text-sm text-slate-300">
                      <strong className="text-blue-400">IPFS Storage:</strong> Your submission will be stored on IPFS for immutable proof of delivery. Include all relevant links and documentation.
                    </div>
                  </div>
                </div>

                <button
                  onClick={submitWork}
                  disabled={!submissionText}
                  className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  <span>Submit Work for Review</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6">
              <h4 className="font-bold mb-4">What Happens Next?</h4>
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-400">1</span>
                  </div>
                  <p>Your submission is stored on IPFS and recorded on the blockchain</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-purple-400">2</span>
                  </div>
                  <p>Client reviews your work and verifies completion</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-green-400">3</span>
                  </div>
                  <p>Upon approval, smart contract automatically releases {activeJob.budget} ETH to your wallet</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-950 text-white min-h-screen font-sans overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-950 to-purple-900/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/95 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <button 
              onClick={() => {
                setCurrentPage('landing');
                setUserType(null);
              }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">DevLance</span>
            </button>
            
            <div className="hidden md:flex items-center space-x-6">
              {walletConnected && (
                <div className="flex items-center space-x-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-mono text-sm">{walletAddress}</span>
                </div>
              )}
              {!walletConnected && currentPage !== 'landing' && (
                <button
                  onClick={connectWallet}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                >
                  Connect Wallet
                </button>
              )}
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10">
        {currentPage === 'landing' && renderLanding()}
        {currentPage === 'create-job' && renderCreateJob()}
        {currentPage === 'marketplace' && renderMarketplace()}
        {currentPage === 'task-completion' && renderTaskCompletion()}
      </div>

      {/* Footer */}
      {currentPage === 'landing' && (
        <footer className="relative z-10 border-t border-slate-800 py-8 px-4">
          <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
            <p>© 2024 DevLance. Built with ❤️ for the decentralized future.</p>
          </div>
        </footer>
      )}
    </div>
  );
}