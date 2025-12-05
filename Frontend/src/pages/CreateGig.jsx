// src/pages/CreateGig.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import Input, { Textarea } from '../components/Input';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { createGig, calculateSecurityHold, calculateTotalWithSecurityHold } from '../services/contract';
import { uploadToIPFS, createJobMetadata } from '../services/api';

export default function CreateGig() {
  const navigate = useNavigate();
  const { account, signer, isConnected, connect, formattedBalance } = useWallet();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    budget: '',
    deadline: '14',
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate step 1
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.title.length > 100) newErrors.title = 'Title must be under 100 characters';
    if (formData.description.length > 2000) newErrors.description = 'Description must be under 2000 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 2
  const validateStep2 = () => {
    const newErrors = {};
    const budget = parseFloat(formData.budget);
    const deadline = parseInt(formData.deadline);

    if (!formData.budget || isNaN(budget) || budget <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }
    if (budget > 1000) {
      newErrors.budget = 'Budget cannot exceed 1000 ETH';
    }
    if (!formData.deadline || isNaN(deadline) || deadline < 1 || deadline > 365) {
      newErrors.deadline = 'Deadline must be between 1 and 365 days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate amounts
  const budgetWei = formData.budget ? ethers.parseEther(formData.budget.toString()) : 0n;
  const securityHoldWei = budgetWei > 0n ? calculateSecurityHold(budgetWei) : 0n;
  const totalWei = budgetWei > 0n ? calculateTotalWithSecurityHold(budgetWei) : 0n;

  const budgetEth = formData.budget || '0';
  const securityHoldEth = securityHoldWei > 0n ? ethers.formatEther(securityHoldWei) : '0';
  const totalEth = totalWei > 0n ? ethers.formatEther(totalWei) : '0';

  // Parse skills
  const skillsArray = formData.skills
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Handle next step
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  // Handle create gig
  const handleCreateGig = async () => {
    // Connect wallet if not connected
    if (!isConnected) {
      const connected = await connect();
      if (!connected) {
        toast.error('Please connect your wallet to create a job');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Create metadata
      const metadata = createJobMetadata({
        title: formData.title.trim(),
        description: formData.description.trim(),
        skills: skillsArray,
        budget: formData.budget,
        deadline: formData.deadline,
        clientAddress: account,
      });

      // Upload to IPFS
      toast.info('Uploading job details to IPFS...');
      const { cid } = await uploadToIPFS(metadata);

      // Create gig on-chain
      toast.info('Please confirm the transaction in MetaMask...');
      const { jobId } = await createGig(
        signer,
        cid,
        budgetWei,
        parseInt(formData.deadline)
      );

      toast.success(`Job created successfully! Job ID: #${jobId}`);
      
      // Navigate to job details
      setTimeout(() => {
        navigate(`/job/${jobId}`);
      }, 1500);

    } catch (error) {
      console.error('Create gig error:', error);
      toast.error(error.message || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress indicator
  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Budget' },
    { num: 3, label: 'Review' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      
      <Header />

      <main className="relative z-10 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Create a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">New Gig</span>
            </h1>
            <p className="text-gray-400">
              Post your job and find talented developers
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all
                  ${step >= s.num 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white/10 text-gray-500'
                  }
                `}>
                  {step > s.num ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${step >= s.num ? 'text-white' : 'text-gray-500'}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-3 ${step > s.num ? 'bg-indigo-600' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <GlassCard>
            {/* Step 1: Job Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Job Details</h2>
                  <p className="text-gray-400 text-sm">Describe what you need done</p>
                </div>

                <Input
                  label="Job Title"
                  name="title"
                  placeholder="e.g., Build a DeFi Dashboard"
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                  hint="Be specific and concise"
                />

                <Textarea
                  label="Description"
                  name="description"
                  placeholder="Describe the project requirements, deliverables, and any specific technologies needed..."
                  value={formData.description}
                  onChange={handleChange}
                  error={errors.description}
                  rows={6}
                  hint="Include all relevant details for developers"
                />

                <Input
                  label="Required Skills (comma-separated)"
                  name="skills"
                  placeholder="e.g., React, Solidity, Web3.js"
                  value={formData.skills}
                  onChange={handleChange}
                  hint="Optional but helps attract the right talent"
                />

                <div className="flex justify-end">
                  <Button variant="primary" onClick={handleNext}>
                    Next: Set Budget
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Budget & Timeline */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Budget & Timeline</h2>
                  <p className="text-gray-400 text-sm">Set your budget and deadline</p>
                </div>

                <Input
                  label="Budget"
                  name="budget"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.5"
                  value={formData.budget}
                  onChange={handleChange}
                  error={errors.budget}
                  suffix="ETH"
                  hint="Amount you'll pay for the completed work"
                />

                {formData.budget && parseFloat(formData.budget) > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Budget</span>
                      <span className="text-white">{budgetEth} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Security Hold (5%)</span>
                      <span className="text-indigo-400">+{parseFloat(securityHoldEth).toFixed(6)} ETH</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between">
                      <span className="text-gray-300 font-medium">Total to Pay</span>
                      <span className="text-white font-bold">{parseFloat(totalEth).toFixed(6)} ETH</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      The security hold is paid to the developer if you reject their work, or returned to you if the job is cancelled.
                    </p>
                  </div>
                )}

                <Input
                  label="Deadline (Days)"
                  name="deadline"
                  type="number"
                  min="1"
                  max="365"
                  placeholder="14"
                  value={formData.deadline}
                  onChange={handleChange}
                  error={errors.deadline}
                  suffix="days"
                  hint="How many days the developer has to complete the work (1-365)"
                />

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </Button>
                  <Button variant="primary" onClick={handleNext}>
                    Next: Review
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Review Your Job</h2>
                  <p className="text-gray-400 text-sm">Confirm the details before posting</p>
                </div>

                {/* Summary Card */}
                <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Title</p>
                    <p className="text-white font-medium">{formData.title}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{formData.description}</p>
                  </div>

                  {skillsArray.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {skillsArray.map((skill, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-lg bg-indigo-500/20 text-indigo-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Budget</span>
                      <span className="text-white">{budgetEth} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Security Hold (5%)</span>
                      <span className="text-indigo-400">+{parseFloat(securityHoldEth).toFixed(6)} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                      <span className="text-white font-medium">Total to Pay</span>
                      <span className="text-emerald-400 font-bold">{parseFloat(totalEth).toFixed(6)} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Deadline</span>
                      <span className="text-white">{formData.deadline} days</span>
                    </div>
                  </div>
                </div>

                {/* Wallet Info */}
                {isConnected && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <div>
                        <p className="text-sm text-emerald-300">Wallet Connected</p>
                        <p className="text-xs text-gray-400">Balance: {formattedBalance} ETH</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm">
                      <p className="text-amber-300 font-medium">Transaction Required</p>
                      <p className="text-gray-400 mt-1">
                        Creating this job will require a MetaMask transaction of <span className="text-white font-medium">{parseFloat(totalEth).toFixed(6)} ETH</span>.
                        This amount will be held in escrow until the job is completed or cancelled.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </Button>
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={handleCreateGig}
                    loading={isSubmitting}
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    }
                  >
                    {isConnected ? 'Create Job' : 'Connect Wallet & Create'}
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  );
}