
import React, { useEffect, useState } from 'react';
import { ResumeForm } from '../components/ResumeForm';
import { PreviewPanel } from '../components/PreviewPanel';
import { Header } from '../components/Header';
import { GenerateLinkModal } from '../components/GenerateLinkModal';
import { Toaster } from '@/components/ui/toaster';
import { useResumeStore } from '../store/useResumeStore';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

const Builder = () => {
  const { resumeData } = useResumeStore();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const navigate = useNavigate();

  const handleGenerateLink = () => {
    setShowLinkModal(true);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* <Header onGenerateLink={handleGenerateLink} /> */}
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Live Preview Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Live Preview</h2>
            <Button
              onClick={() => navigate('/live-preview')}
              className="flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Full Screen Preview</span>
            </Button>
          </div>
          <PreviewPanel />
        </div>

        {/* Resume Form */}
        <div className="space-y-6">
          <ResumeForm />
        </div>
      </div>

      <GenerateLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
      />
      <Toaster />
    </div>
  );
};

export default Builder;
