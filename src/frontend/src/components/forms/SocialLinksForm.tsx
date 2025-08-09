import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Share2, Plus, Trash2, Linkedin, Github, Twitter, Globe, Instagram, Facebook } from 'lucide-react';
import { useResumeStore } from '../../store/useResumeStore';

const socialPlatforms = [
  { name: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/yourprofile' },
  { name: 'GitHub', icon: Github, placeholder: 'https://github.com/yourusername' },
  { name: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/yourusername' },
  { name: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
  { name: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourusername' },
  { name: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourusername' },
];

export const SocialLinksForm: React.FC = () => {
  const { resumeData, addSocialLink, updateSocialLink, removeSocialLink } = useResumeStore();
  const { socialLinks } = resumeData;
  const [newLink, setNewLink] = useState({ platform: '', url: '' });

  const handleAddLink = () => {
    if (newLink.platform && newLink.url) {
      addSocialLink(newLink);
      setNewLink({ platform: '', url: '' });
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformData = socialPlatforms.find(p => p.name === platform);
    return platformData?.icon || Globe;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share2 className="w-5 h-5" />
          <span>Social Media Links</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Social Links */}
        {socialLinks.map((link) => {
          const IconComponent = getPlatformIcon(link.platform);
          return (
            <div key={link.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <IconComponent className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">{link.platform}</div>
                <div className="text-sm text-gray-600 truncate">{link.url}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateSocialLink(link.id, { url: link.url })}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeSocialLink(link.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}

        {/* Add New Social Link */}
        <div className="space-y-3 p-4 border-2 border-dashed border-gray-200 rounded-lg">
          <Label>Add New Social Link</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                value={newLink.platform}
                onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Platform</option>
                {socialPlatforms.map((platform) => (
                  <option key={platform.name} value={platform.name}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="socialUrl">URL</Label>
              <Input
                id="socialUrl"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder={
                  socialPlatforms.find(p => p.name === newLink.platform)?.placeholder || 
                  'https://example.com/yourprofile'
                }
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddLink} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
