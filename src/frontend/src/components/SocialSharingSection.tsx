
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2 } from 'lucide-react';
import { SocialLinksForm } from './forms/SocialLinksForm';
import { ShareOptions } from './ShareOptions';
import { QRCodeGenerator } from './QRCodeGenerator';

export const SocialSharingSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share2 className="w-5 h-5" />
          <span>Social & Sharing</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SocialLinksForm />
        <ShareOptions />
        <QRCodeGenerator />
      </CardContent>
    </Card>
  );
};
