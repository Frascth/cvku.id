
import React, { useState } from 'react';
import { ResumeForm } from '../components/ResumeForm';
import { PreviewPanel } from '../components/PreviewPanel';
import { Header } from '../components/Header';
import { GenerateLinkModal } from '../components/GenerateLinkModal';
import { Toaster } from '@/components/ui/toaster';
import { useResumeStore } from '../store/useResumeStore';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { resumeData } = useResumeStore();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate Internet Identity login
    setIsAuthenticated(true);
  };

  const handleGenerateLink = () => {
    setShowLinkModal(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-xl">CV</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CvKu.id</h1>
            <p className="text-gray-600 mb-8">Create your decentralized resume in minutes</p>
            <div className="space-y-4">
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Quick Demo Login
              </button>
              <div className="flex space-x-2">
                <a
                  href="/signin"
                  className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 text-center"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 text-center"
                >
                  Sign Up
                </a>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">Secure, decentralized authentication</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header onGenerateLink={handleGenerateLink} />

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

export default Index;
