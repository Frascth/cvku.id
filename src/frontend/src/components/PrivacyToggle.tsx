
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Shield, ShieldCheck, Lock, Globe } from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';

export const PrivacyToggle: React.FC = () => {
  const { isPrivate, setPrivacy } = useResumeStore();
  const { toast } = useToast();

  const handlePrivacyChange = (checked: boolean) => {
    setPrivacy(checked);
    toast({
      title: checked ? "Resume Set to Private" : "Resume Set to Public",
      description: checked 
        ? "Your resume is now private and requires authentication to view"
        : "Your resume is now publicly accessible via shared links",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isPrivate ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
          <span>Privacy Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            {isPrivate ? (
              <ShieldCheck className="w-6 h-6 text-green-600" />
            ) : (
              <Shield className="w-6 h-6 text-blue-600" />
            )}
            <div>
              <h3 className="font-semibold">
                {isPrivate ? 'Private Resume' : 'Public Resume'}
              </h3>
              <p className="text-sm text-gray-600">
                {isPrivate 
                  ? 'Only accessible with authentication'
                  : 'Anyone with the link can view'
                }
              </p>
            </div>
          </div>
          <Switch
            checked={isPrivate}
            onCheckedChange={handlePrivacyChange}
          />
        </div>

        <div className="space-y-3">
          <div className={`p-3 rounded-lg border-l-4 ${
            isPrivate 
              ? 'bg-green-50 border-green-400' 
              : 'bg-blue-50 border-blue-400'
          }`}>
            <h4 className="font-medium mb-2">
              {isPrivate ? 'Private Mode Benefits:' : 'Public Mode Benefits:'}
            </h4>
            <ul className="text-sm space-y-1">
              {isPrivate ? (
                <>
                  <li>• Enhanced security and privacy protection</li>
                  <li>• Control who can access your resume</li>
                  <li>• Track who views your resume</li>
                  <li>• Perfect for confidential job searches</li>
                </>
              ) : (
                <>
                  <li>• Easy sharing via direct links</li>
                  <li>• No login required for viewers</li>
                  <li>• Better for networking and visibility</li>
                  <li>• Searchable by recruiters</li>
                </>
              )}
            </ul>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Security Note:</p>
            <p>
              {isPrivate 
                ? 'Private resumes require Internet Identity authentication. Viewers must be logged in to access your resume.'
                : 'Public resumes are accessible to anyone with the link. Consider this when sharing sensitive information.'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
