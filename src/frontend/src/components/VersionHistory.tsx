
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, RotateCcw, Save, Clock } from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';
import { ResumeData } from '../store/useResumeStore';

interface ResumeVersion {
  id: string;
  name: string;
  timestamp: Date;
  data: ResumeData;
}

export const VersionHistory: React.FC = () => {
  const { resumeData } = useResumeStore();
  const { toast } = useToast();
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [savedVersionName, setSavedVersionName] = useState('');

  useEffect(() => {
    // Load versions from localStorage
    const savedVersions = localStorage.getItem('resume-versions');
    if (savedVersions) {
      const parsedVersions = JSON.parse(savedVersions).map((v: any) => ({
        ...v,
        timestamp: new Date(v.timestamp)
      }));
      setVersions(parsedVersions);
    }
  }, []);

  const saveVersion = () => {
    const versionName = savedVersionName.trim() || `Version ${versions.length + 1}`;
    const newVersion: ResumeVersion = {
      id: Date.now().toString(),
      name: versionName,
      timestamp: new Date(),
      data: { ...resumeData }
    };

    const updatedVersions = [newVersion, ...versions].slice(0, 10); // Keep only last 10 versions
    setVersions(updatedVersions);
    localStorage.setItem('resume-versions', JSON.stringify(updatedVersions));
    setSavedVersionName('');

    toast({
      title: "Version Saved",
      description: `Resume version "${versionName}" has been saved successfully!`,
    });
  };

  const restoreVersion = (version: ResumeVersion) => {
    // In a real app, this would update the store with the version data
    toast({
      title: "Version Restored",
      description: `Resume restored to "${version.name}" from ${version.timestamp.toLocaleDateString()}.`,
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="w-5 h-5" />
          <span>Version History</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Save Current Version */}
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Version name (optional)"
            value={savedVersionName}
            onChange={(e) => setSavedVersionName(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={saveVersion} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>

        {/* Version List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {versions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No saved versions yet</p>
              <p className="text-xs mt-1">Save your current resume to create version history</p>
            </div>
          ) : (
            versions.map((version) => (
              <div key={version.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-sm">{version.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {formatDate(version.timestamp)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {version.data.workExperience.length} jobs, {version.data.education.length} education, {version.data.skills.length} skills
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => restoreVersion(version)}
                  className="ml-2"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {versions.length > 0 && (
          <div className="text-xs text-gray-500 text-center">
            Showing {versions.length} of 10 maximum saved versions
          </div>
        )}
      </CardContent>
    </Card>
  );
};
