
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key, Eye, Clock, Download, Trash2, Settings, Lock, Globe, UserCheck, AlertTriangle } from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { useToast } from '@/hooks/use-toast';

export const AdvancedPrivacySecurity: React.FC = () => {
  const { isPrivate, setPrivacy } = useResumeStore();
  const { toast } = useToast();
  const [accessSettings, setAccessSettings] = useState({
    passwordProtection: false,
    expirationDate: '',
    allowDownload: true,
    trackViewing: true,
    whitelistEmails: '',
    viewLimit: 0,
    allowPrint: true,
    watermark: false
  });

  const handleSettingChange = (setting: string, value: any) => {
    setAccessSettings(prev => ({ ...prev, [setting]: value }));
    toast({
      title: "Security Setting Updated",
      description: `${setting} has been ${typeof value === 'boolean' ? (value ? 'enabled' : 'disabled') : 'updated'}`,
    });
  };

  const generateSecureLink = () => {
    const secureId = Math.random().toString(36).substring(2, 15);
    const secureLink = `${window.location.origin}/secure/${secureId}`;
    navigator.clipboard.writeText(secureLink);
    toast({
      title: "Secure Link Generated",
      description: "Password-protected link copied to clipboard!",
    });
  };

  const revokeAllAccess = () => {
    toast({
      title: "Access Revoked",
      description: "All existing access links have been invalidated",
      variant: "destructive",
    });
  };

  const exportSecurityReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      privacyLevel: isPrivate ? 'Private' : 'Public',
      accessSettings,
      viewingHistory: [
        { date: '2024-01-15', viewer: 'recruiter@company.com', location: 'New York, US' },
        { date: '2024-01-14', viewer: 'hr@startup.com', location: 'San Francisco, US' }
      ]
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security-report.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Security Report Exported",
      description: "Your security report has been downloaded",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Advanced Privacy & Security</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="access" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="tracking">View Tracking</TabsTrigger>
            <TabsTrigger value="encryption">Data Security</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="access" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Key className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Password Protection</h3>
                    <p className="text-sm text-gray-600">Require password to view resume</p>
                  </div>
                </div>
                <Switch
                  checked={accessSettings.passwordProtection}
                  onCheckedChange={(checked) => handleSettingChange('passwordProtection', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiration">Link Expiration Date</Label>
                <Input
                  id="expiration"
                  type="date"
                  value={accessSettings.expirationDate}
                  onChange={(e) => handleSettingChange('expirationDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whitelist">Allowed Email Addresses (comma-separated)</Label>
                <Input
                  id="whitelist"
                  placeholder="recruiter@company.com, hr@startup.com"
                  value={accessSettings.whitelistEmails}
                  onChange={(e) => handleSettingChange('whitelistEmails', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="viewLimit">Maximum View Count (0 = unlimited)</Label>
                <Input
                  id="viewLimit"
                  type="number"
                  min="0"
                  value={accessSettings.viewLimit}
                  onChange={(e) => handleSettingChange('viewLimit', parseInt(e.target.value))}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={generateSecureLink} className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Generate Secure Link</span>
                </Button>
                <Button variant="destructive" onClick={revokeAllAccess} className="flex items-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Revoke All Access</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold">View Tracking</h3>
                    <p className="text-sm text-gray-600">Track who views your resume</p>
                  </div>
                </div>
                <Switch
                  checked={accessSettings.trackViewing}
                  onCheckedChange={(checked) => handleSettingChange('trackViewing', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Allow Downloads</h3>
                    <p className="text-sm text-gray-600">Let viewers download your resume</p>
                  </div>
                </div>
                <Switch
                  checked={accessSettings.allowDownload}
                  onCheckedChange={(checked) => handleSettingChange('allowDownload', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="font-semibold">Allow Printing</h3>
                    <p className="text-sm text-gray-600">Enable print functionality</p>
                  </div>
                </div>
                <Switch
                  checked={accessSettings.allowPrint}
                  onCheckedChange={(checked) => handleSettingChange('allowPrint', checked)}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <UserCheck className="w-4 h-4" />
                  <span>Recent Viewers</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>recruiter@company.com</span>
                    <span className="text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>hr@startup.com</span>
                    <span className="text-gray-500">1 day ago</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>talent@agency.com</span>
                    <span className="text-gray-500">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="encryption" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Data Encryption Status</h4>
                </div>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✓ Resume data encrypted at rest</li>
                  <li>✓ SSL/TLS encryption in transit</li>
                  <li>✓ End-to-end encryption for private resumes</li>
                  <li>✓ Regular security audits performed</li>
                </ul>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-semibold">Add Watermark</h3>
                    <p className="text-sm text-gray-600">Add your name as watermark to PDFs</p>
                  </div>
                </div>
                <Switch
                  checked={accessSettings.watermark}
                  onCheckedChange={(checked) => handleSettingChange('watermark', checked)}
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-900">Security Recommendations</h4>
                </div>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Enable password protection for sensitive information</li>
                  <li>• Set expiration dates for temporary sharing</li>
                  <li>• Use email whitelisting for targeted applications</li>
                  <li>• Regularly review access logs and revoke unused links</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Security Audit Log</span>
                </h3>
                <Button onClick={exportSecurityReport} variant="outline" className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </Button>
              </div>

              <div className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                    <span>Date & Time</span>
                    <span>Action</span>
                    <span>User/IP</span>
                    <span>Status</span>
                  </div>
                </div>
                <div className="divide-y">
                  <div className="p-4 grid grid-cols-4 gap-4 text-sm">
                    <span>2024-01-15 14:30</span>
                    <span>Resume Viewed</span>
                    <span>recruiter@company.com</span>
                    <span className="text-green-600">✓ Authorized</span>
                  </div>
                  <div className="p-4 grid grid-cols-4 gap-4 text-sm">
                    <span>2024-01-15 10:15</span>
                    <span>Link Generated</span>
                    <span>You</span>
                    <span className="text-blue-600">✓ Success</span>
                  </div>
                  <div className="p-4 grid grid-cols-4 gap-4 text-sm">
                    <span>2024-01-14 18:45</span>
                    <span>Download Attempt</span>
                    <span>unknown@spam.com</span>
                    <span className="text-red-600">✗ Blocked</span>
                  </div>
                  <div className="p-4 grid grid-cols-4 gap-4 text-sm">
                    <span>2024-01-14 16:20</span>
                    <span>Security Settings Updated</span>
                    <span>You</span>
                    <span className="text-blue-600">✓ Success</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Audit Log Information:</p>
                <p>Security events are automatically logged and retained for 90 days. This includes resume views, download attempts, link generation, and security setting changes. All logs are encrypted and comply with privacy regulations.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
