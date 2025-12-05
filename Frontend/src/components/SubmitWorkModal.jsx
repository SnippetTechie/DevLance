// src/components/SubmitWorkModal.jsx
import { useState } from 'react';
import Modal, { ModalFooter } from './Modal';
import Button from './Button';
import { Textarea } from './Input';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';
import { submitWork } from '../services/contract';
import { uploadToIPFS, createSubmissionMetadata } from '../services/api';

export default function SubmitWorkModal({ isOpen, onClose, job, onSuccess }) {
  const { account, signer, isConnected, connect } = useWallet();
  const toast = useToast();
  
  const [submission, setSubmission] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState('form'); // form | confirm | submitting | success

  const handleSubmit = async () => {
    if (!submission.trim()) {
      toast.error('Please provide submission details');
      return;
    }

    // If not connected, connect first
    if (!isConnected) {
      const connected = await connect();
      if (!connected) {
        toast.error('Please connect your wallet to submit work');
        return;
      }
    }

    setStep('confirm');
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setStep('submitting');

    try {
      // Create submission metadata
      const metadata = createSubmissionMetadata({
        jobId: job.jobId,
        description: submission,
        developerAddress: account,
      });

      // Upload to IPFS
      toast.info('Uploading submission to IPFS...');
      const { cid } = await uploadToIPFS(metadata);

      // Submit work on-chain
      toast.info('Please confirm the transaction in MetaMask...');
      const { receipt } = await submitWork(signer, job.jobId, cid);

      toast.success('Work submitted successfully!');
      setStep('success');

      // Callback after short delay
      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Submit work error:', error);
      toast.error(error.message || 'Failed to submit work');
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmission('');
    setStep('form');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Submit Your Work"
      description={`Job #${job?.jobId}: ${job?.metadata?.title || 'Untitled'}`}
      size="md"
    >
      {step === 'form' && (
        <>
          <div className="space-y-4">
            <Textarea
              label="Submission Details"
              placeholder="Describe your completed work. Include links to deliverables, GitHub repos, deployed sites, etc."
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              rows={6}
              hint="Your submission will be stored on IPFS and linked to this job on-chain."
            />

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="text-indigo-300 font-medium">What happens next?</p>
                  <p className="text-gray-400 mt-1">
                    After you submit, the client will review your work. If approved, you'll receive the full payment. 
                    If rejected, you'll still receive the security deposit (5%).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              disabled={!submission.trim()}
            >
              {isConnected ? 'Continue' : 'Connect Wallet & Continue'}
            </Button>
          </ModalFooter>
        </>
      )}

      {step === 'confirm' && (
        <>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Your Submission</h4>
              <p className="text-white whitespace-pre-wrap">{submission}</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm">
                  <p className="text-amber-300 font-medium">Confirm Transaction</p>
                  <p className="text-gray-400 mt-1">
                    You'll need to confirm this transaction in MetaMask. This will record your submission on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="ghost" onClick={() => setStep('form')}>
              Back
            </Button>
            <Button 
              variant="primary" 
              onClick={handleConfirmSubmit}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              Confirm & Submit
            </Button>
          </ModalFooter>
        </>
      )}

      {step === 'submitting' && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-white font-medium mb-2">Submitting your work...</p>
          <p className="text-gray-400 text-sm text-center">
            Please confirm the transaction in MetaMask and wait for it to be processed.
          </p>
        </div>
      )}

      {step === 'success' && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white font-medium mb-2">Work Submitted!</p>
          <p className="text-gray-400 text-sm text-center">
            Your submission has been recorded. The client will review it soon.
          </p>
        </div>
      )}
    </Modal>
  );
}