
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const QRCodeGenerator: React.FC = () => {
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);
  const resumeUrl = `${window.location.origin}/resume/demo-123`;

  const generateQR = () => {
    setShowQR(true);
    toast({
      title: "QR Code Generated",
      description: "QR code for your resume has been generated!",
    });
  };

  const downloadQR = () => {
    // Mock download functionality
    toast({
      title: "QR Code Downloaded",
      description: "QR code image has been saved to your downloads!",
    });
  };

  const shareQR = () => {
    navigator.clipboard.writeText(resumeUrl);
    toast({
      title: "QR Code Shared",
      description: "Resume link copied to clipboard for sharing!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="w-5 h-5" />
          <span>QR Code Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Generate a QR code for easy sharing of your resume. People can scan it with their phones to instantly access your resume.
        </div>
        
        {!showQR ? (
          <Button onClick={generateQR} className="w-full">
            <QrCode className="w-4 h-4 mr-2" />
            Generate QR Code
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
              <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <QrCode className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm font-medium">QR Code</p>
                  <p className="text-xs">(Demo)</p>
                  <p className="text-xs mt-2 break-all px-2">{resumeUrl}</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={downloadQR} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={shareQR} variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
            
            <Button 
              onClick={() => setShowQR(false)} 
              variant="ghost" 
              className="w-full text-sm"
            >
              Generate New QR Code
            </Button>
          </div>
        )}
        
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Pro Tip:</p>
          <p>Add this QR code to your business cards or portfolio for instant resume access!</p>
        </div>
      </CardContent>
    </Card>
  );
};
