
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, User } from 'lucide-react';
import { useResumeStore } from '../../store/useResumeStore';
import { PhotoUpload } from '../PhotoUpload';
import { Button } from '../ui/button';
import { useToast } from "@/hooks/use-toast";
export const PersonalInfoForm: React.FC = () => {
  const { resumeData, updatePersonalInfo } = useResumeStore();
  const { personalInfo } = resumeData;
  const { toast } = useToast();
  const handleSave = () => {
    toast({
      title: "Saved!",
      description: "Education information has been saved successfully.",
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Personal Information</span>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleSave}
              size="sm"
              variant="outline"
              className="flex items-center space-x-1"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Label>Profile Photo</Label>
            <PhotoUpload
              photoUrl={personalInfo.photoUrl}
              onPhotoChange={(photoUrl) =>
                updatePersonalInfo({ photoUrl: photoUrl || undefined })
              }
              className="mt-2"
            />
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={personalInfo.fullName}
                  onChange={(e) =>
                    updatePersonalInfo({ fullName: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) =>
                    updatePersonalInfo({ email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={personalInfo.phone}
                  onChange={(e) =>
                    updatePersonalInfo({ phone: e.target.value })
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={personalInfo.location}
                  onChange={(e) =>
                    updatePersonalInfo({ location: e.target.value })
                  }
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={personalInfo.website}
                onChange={(e) =>
                  updatePersonalInfo({ website: e.target.value })
                }
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <Label htmlFor="bio">Professional Summary</Label>
              <Textarea
                id="bio"
                value={personalInfo.bio}
                onChange={(e) => updatePersonalInfo({ bio: e.target.value })}
                placeholder="Write a brief summary about yourself..."
                rows={4}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
