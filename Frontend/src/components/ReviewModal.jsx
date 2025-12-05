// src/components/ReviewModal.jsx
import { useState } from 'react';
import { ethers } from 'ethers';
import Modal, { ModalFooter } from './Modal';
import Button from './Button';
import GlassCard from './GlassCard';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { releaseFullPayment, releasePartialPayment } from '../services/contract';
import { fetchFromIPFS } from '../services/api';

export default function ReviewModal({ isOpen, onClose, job, onSuccess }) {
  const { signer, isConnected, connect } = useWallet();
  const toast = useToast();

  const [submissionData, setSubmissionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState('review'); // review | approve | reject | processing | success

  // Calculate amounts
  const amount = job?.amount ? BigInt(job.amount.toString()) : 0n;
  const securityHold = job?.securityHold ? BigInt(job.securityHold.toString()) : 0n;
  const totalAmount = amount + securityHold;

  const amountEth = ethers.formatEther(amount.toString());
  const securityHoldEth = ethers.formatEther(securityHold.toString());
  const totalEth = ethers.formatEther(totalAmount.toString());

  // Shorten address
  const shortAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  // Load submission data from IPFS
  const loadSubmission = async () => {
    if (job?.submission && !submissionData) {
      setIsLoading(true);
      try {
        const data = await fetchFromIPFS(job.submission);
        setSubmissionData(data);
      } catch (error) {
        console.error('Failed to load submission:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Load on open
  useState(() => {
    if (isOpen) {
      loadSubmission();
    }
  }, [isOpen]);

  const handleApprove = async () => {
    if (!isConnected) {
      const connected = await connect();
      if (!connected) {
        toast.error('Please connect your wallet');
        return;
      }
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      toast.info('Please confirm the transaction in MetaMask...');
      await releaseFullPayment(signer, job.jobId);

      toast.success('Payment released successfully!');
      setStep('success');

      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetModal();
      }, 2000);

    } catch (error) {
      console.error('Approve error:', error);
      toast.error(error.message || 'Failed to release payment');
      setStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!isConnected) {
      const connected = await connect();
      if (!connected) {
        toast.error('Please connect your wallet');
        return;
      }
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      // Pay the security hold to developer
      toast.info('Please confirm the transaction in MetaMask...');
      await releasePartialPayment(signer, job.jobId, securityHold);

      toast.success('Work rejected. Security deposit paid to developer.');
      setStep('success');

      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetModal();
      }, 2000);

    } catch (error) {
      console.error('Reject error:', error);
      toast.error(error.message || 'Failed to process rejection');
      setStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setStep('review');
    setIsProcessing(false);
    setSubmissionData(null);
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetModal();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Review Submission"
      description={`Job #${job?.jobId}: ${job?.metadata?.title || 'Untitled'}`}
      size="lg"
    >
      {step === 'review' && (
        <>
          <div className="space-y-6">
            {/* Developer Info */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Developer</p>
                <p className="text-white font-mono">{shortAddress(job?.developer)}</p>
              </div>
            </div>

            {/* Submission Content */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Submission Details</h4>
              <GlassCard padding="p-4" className="max-h-48 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading submission...
                  </div>
                ) : submissionData ? (
                  <div className="space-y-2">
                    <p className="text-white whitespace-pre-wrap">{submissionData.description}</p>
                    {submissionData.links?.length > 0 && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-sm text-gray-400 mb-1">Links:</p>
                        {submissionData.links.map((link, i) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-sm block">
                            {link}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    IPFS CID: {job?.submission || 'No submission data'}
                  </p>
                )}
              </GlassCard>
            </div>

            {/* Payment Summary */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400">Payment Summary</h4>
              
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-emerald-300 font-medium">If Approved</span>
                  <span className="text-emerald-400 font-bold">{totalEth} ETH</span>
                </div>
                <p className="text-sm text-gray-400">
                  Developer receives full payment ({amountEth} ETH) plus security deposit ({securityHoldEth} ETH).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-red-300 font-medium">If Rejected</span>
                  <div className="text-right">
                    <p className="text-red-400 font-bold">{securityHoldEth} ETH → Developer</p>
                    <p className="text-gray-400 text-sm">{amountEth} ETH → You</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Developer receives security deposit only. Remaining amount is refunded to you.
                </p>
              </div>
            </div>
          </div>

          <ModalFooter className="flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={handleClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                variant="danger" 
                onClick={handleReject}
                className="flex-1 sm:flex-none"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              >
                Reject
              </Button>
              <Button 
                variant="success" 
                onClick={handleApprove}
                className="flex-1 sm:flex-none"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              >
                Approve & Pay
              </Button>
            </div>
          </ModalFooter>
        </>
      )}

      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-white font-medium mb-2">Processing transaction...</p>
          <p className="text-gray-400 text-sm text-center">
            Please confirm in MetaMask and wait for the transaction to complete.
          </p>
        </div>
      )}

      {step === 'success' && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white font-medium mb-2">Transaction Complete!</p>
          <p className="text-gray-400 text-sm text-center">
            The payment has been processed successfully.
          </p>
        </div>
      )}
    </Modal>
  );
}