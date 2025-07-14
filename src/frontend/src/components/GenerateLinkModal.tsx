
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Link, Share2, Download, QrCode, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useResumeStore } from '../store/useResumeStore';

interface GenerateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenerateLinkModal: React.FC<GenerateLinkModalProps> = ({ isOpen, onClose }) => {
  const { resumeData, isPrivate } = useResumeStore();
  const { toast } = useToast();
  const [customSlug, setCustomSlug] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  // Generate demo link based on user name and custom slug
  const generateResumeLink = () => {
    const baseUrl = window.location.origin;
    const slug = customSlug || resumeData.personalInfo.fullName.toLowerCase().replace(/\s+/g, '-');
    const link = `${baseUrl}/resume/${slug}${isPrivate ? '?private=true' : ''}`;
    setGeneratedLink(link);
    toast({
      title: "Resume Link Generated",
      description: "Your shareable resume link has been created!",
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "Resume link copied successfully!",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareViaEmail = () => {
    const subject = `${resumeData.personalInfo.fullName}'s Resume`;
    const body = `Hi! I'd like to share my resume with you: ${generatedLink}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareOnSocial = (platform: string) => {
    const text = `Check out ${resumeData.personalInfo.fullName}'s resume`;
    const url = generatedLink;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}: ${url}`)}`
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Link className="w-5 h-5" />
            <span>Generate Resume Link</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Custom Slug Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Custom URL Slug (Optional)
            </label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="your-name or custom-slug"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use your name: {resumeData.personalInfo.fullName.toLowerCase().replace(/\s+/g, '-')}
                </p>
              </div>
              <Button onClick={generateResumeLink}>
                Generate Link
              </Button>
            </div>
          </div>

          {/* Generated Link Display */}
          {generatedLink && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Resume Link:
                    </label>
                    <div className="flex space-x-2">
                      <Input 
                        value={generatedLink} 
                        readOnly 
                        className="bg-gray-50"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => copyToClipboard(generatedLink)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.open(generatedLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Privacy Status */}
                  <div className={`p-3 rounded-lg ${
                    isPrivate ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
                  }`}>
                    <p className="text-sm">
                      <strong>Privacy Status:</strong> {isPrivate ? 'Private' : 'Public'}
                      {isPrivate && ' - Viewers will need to authenticate to access this resume'}
                    </p>
                  </div>

                  {/* Share Options */}
                  <div>
                    <h3 className="font-medium mb-3 flex items-center space-x-2">
                      <Share2 className="w-4 h-4" />
                      <span>Share Options</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Button variant="outline" onClick={shareViaEmail} className="flex items-center space-x-2">
                        <span>📧</span>
                        <span>Email</span>
                      </Button>
                      <Button variant="outline" onClick={() => shareOnSocial('linkedin')} className="flex items-center space-x-2">
                        <span>💼</span>
                        <span>LinkedIn</span>
                      </Button>
                      <Button variant="outline" onClick={() => shareOnSocial('twitter')} className="flex items-center space-x-2">
                        <span>🐦</span>
                        <span>Twitter</span>
                      </Button>
                      <Button variant="outline" onClick={() => shareOnSocial('whatsapp')} className="flex items-center space-x-2">
                        <span>💬</span>
                        <span>WhatsApp</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Link Management Tips */}
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Link Management Tips:</p>
            <ul className="space-y-1">
              <li>• Use a professional, memorable slug for your resume URL</li>
              <li>• Share your resume link on business cards and email signatures</li>
              <li>• Update your resume content anytime - the link stays the same</li>
              <li>• {isPrivate ? 'Private links provide better security for sensitive searches' : 'Public links are great for networking and visibility'}</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
