
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Linkedin, Twitter, Facebook, Mail, MessageCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ShareOptions: React.FC = () => {
  const { toast } = useToast();
  const resumeUrl = `${window.location.origin}/resume/demo-123`;
  const resumeTitle = "Check out my professional resume";

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resumeUrl)}`;
    window.open(linkedInUrl, '_blank');
    toast({
      title: "Shared to LinkedIn",
      description: "Opening LinkedIn share dialog...",
    });
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(resumeTitle)}&url=${encodeURIComponent(resumeUrl)}`;
    window.open(twitterUrl, '_blank');
    toast({
      title: "Shared to Twitter",
      description: "Opening Twitter share dialog...",
    });
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resumeUrl)}`;
    window.open(facebookUrl, '_blank');
    toast({
      title: "Shared to Facebook",
      description: "Opening Facebook share dialog...",
    });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("My Professional Resume");
    const body = encodeURIComponent(`Hi,\n\nI'd like to share my resume with you: ${resumeUrl}\n\nBest regards`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = emailUrl;
    toast({
      title: "Opening Email",
      description: "Preparing email with resume link...",
    });
  };

  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${resumeTitle} ${resumeUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    toast({
      title: "Shared to WhatsApp",
      description: "Opening WhatsApp share dialog...",
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(resumeUrl);
    toast({
      title: "Link Copied",
      description: "Resume link has been copied to clipboard!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share2 className="w-5 h-5" />
          <span>Share Resume</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            onClick={shareToLinkedIn}
            className="flex flex-col items-center p-4 h-auto space-y-2"
          >
            <Linkedin className="w-6 h-6 text-blue-600" />
            <span className="text-sm">LinkedIn</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={shareToTwitter}
            className="flex flex-col items-center p-4 h-auto space-y-2"
          >
            <Twitter className="w-6 h-6 text-blue-400" />
            <span className="text-sm">Twitter</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={shareToFacebook}
            className="flex flex-col items-center p-4 h-auto space-y-2"
          >
            <Facebook className="w-6 h-6 text-blue-700" />
            <span className="text-sm">Facebook</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={shareViaEmail}
            className="flex flex-col items-center p-4 h-auto space-y-2"
          >
            <Mail className="w-6 h-6 text-gray-600" />
            <span className="text-sm">Email</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={shareViaWhatsApp}
            className="flex flex-col items-center p-4 h-auto space-y-2"
          >
            <MessageCircle className="w-6 h-6 text-green-600" />
            <span className="text-sm">WhatsApp</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={copyLink}
            className="flex flex-col items-center p-4 h-auto space-y-2"
          >
            <Copy className="w-6 h-6 text-purple-600" />
            <span className="text-sm">Copy Link</span>
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Resume URL:</div>
          <div className="text-sm font-mono bg-white p-2 rounded border break-all">
            {resumeUrl}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
