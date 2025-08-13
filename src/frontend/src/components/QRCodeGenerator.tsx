import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResumeStore } from "@/store/useResumeStore";
import { QRCodeSVG } from "qrcode.react";

export const QRCodeGenerator: React.FC = () => {
  const { getResumeLinkUrl } = useResumeStore();

  const { toast } = useToast();

  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [showQR, setShowQR] = useState(false);

  const resumeUrl = getResumeLinkUrl();

  const generateQR = () => {
    setShowQR(true);
    toast({
      title: "QR Code Generated",
      description: "QR code for your resume has been generated!",
    });
  };

  const downloadQR = () => {
    if (qrCodeRef.current) {
      const svgElement = qrCodeRef.current.querySelector("svg");
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();

        img.onload = () => {
          const originalWidth = img.width;
          const originalHeight = img.height;
          const newWidth = originalWidth * 2;
          const newHeight = originalHeight * 2;
          const borderWidth = 10; // Adjust frame thickness as needed

          const canvas = document.createElement("canvas");
          canvas.width = newWidth + 2 * borderWidth;
          canvas.height = newHeight + 2 * borderWidth;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            // White background
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Black frame
            ctx.strokeStyle = "white";
            ctx.lineWidth = borderWidth;
            ctx.strokeRect(
              borderWidth / 2,
              borderWidth / 2,
              canvas.width - borderWidth,
              canvas.height - borderWidth
            );

            // Draw the QR code image, scaled up
            ctx.drawImage(img, borderWidth, borderWidth, newWidth, newHeight);

            const link = document.createElement("a");
            link.download = "resume-qr-code.jpg";
            link.href = canvas.toDataURL("image/jpeg", 0.9);
            link.click();
          }

          toast({
            title: "QR Code Downloaded",
            description: "QR code image with frame saved as a JPG file!",
          });
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      }
    }
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
          Generate a QR code for easy sharing of your resume. People can scan it
          with their phones to instantly access your resume.
        </div>

        {!showQR ? (
          <Button onClick={generateQR} className="w-full">
            <QrCode className="w-4 h-4 mr-2" />
            Generate QR Code
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
              <div
                id="qr-code-container"
                ref={qrCodeRef}
                className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center"
              >
                <div className="text-center text-gray-500">
                  <div className="w-full flex justify-center align-middle">
                    <QRCodeSVG
                      value={resumeUrl}
                      size={128}
                    />
                  </div>
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
          </div>
        )}

        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Pro Tip:</p>
          <p>
            Add this QR code to your business cards or portfolio for instant
            resume access!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
