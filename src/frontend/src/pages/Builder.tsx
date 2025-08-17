
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
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useToast } from '@/hooks/use-toast';

const Builder = () => {

  const { resumeData, isPersonalInfoFilled } = useResumeStore();

  const [showLinkModal, setShowLinkModal] = useState(false);

  const { isAuthenticated } = useAuth();
  
  const navigate = useNavigate();

  const { toast } = useToast();

  const handleGenerateLink = () => {
    try {
      if (! isPersonalInfoFilled()) {
        throw new Error("Fill your personal info");
      }

      setShowLinkModal(true);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: error.message ?? "Something went wrong with the custom section service.",
        variant: "destructive",
      });
    }
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

      <div className="flex-1 overflow-hidden">
        <div className="h-[calc(100vh-80px)]">
          <ResizablePanelGroup direction="horizontal" className="min-h-full">
            {/* Form Panel */}
            <ResizablePanel defaultSize={45} minSize={30}>
              <div className="h-full overflow-y-auto p-6">
                <div className="max-w-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
                    <Button
                      onClick={handleGenerateLink}
                      variant="outline"
                      size="sm"
                    >
                      Generate Link
                    </Button>
                  </div>
                  <ResumeForm />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Preview Panel */}
            <ResizablePanel defaultSize={55} minSize={30}>
              <div className="h-full overflow-y-auto bg-gray-50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span>Live Preview</span>
                  </h2>
                  <Button
                    onClick={() => navigate('/live-preview')}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Full Screen</span>
                  </Button>
                </div>
                <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                  <div className="transform scale-90 origin-top-left w-[111.11%] h-auto">
                    <PreviewPanel />
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
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
