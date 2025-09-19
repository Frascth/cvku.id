import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Link2, 
  Copy, 
  ExternalLink, 
  Share2, 
  Mail, 
  MessageCircle, 
  Twitter,
  Facebook,
  Linkedin,
  Globe,
  Eye,
  EyeOff,
  Settings,
  QrCode
} from 'lucide-react';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

const CreatePublicLink = () => {
  const [customSlug, setCustomSlug] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [allowDownload, setAllowDownload] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [expirationDays, setExpirationDays] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const { toast } = useToast();

  const generateLink = () => {
    const baseUrl = 'https://resumebuilder.com/resume/';
    const slug = customSlug || 'john-doe-developer';
    const link = baseUrl + slug;
    setGeneratedLink(link);
    
    toast({
      title: "Link Generated!",
      description: "Your public resume link has been created successfully.",
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive"
      });
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Check out my resume');
    const body = encodeURIComponent(`Hi,\n\nI'd like to share my resume with you: ${generatedLink}\n\nBest regards`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareOnSocial = (platform: string) => {
    const text = encodeURIComponent('Check out my professional resume');
    const url = encodeURIComponent(generatedLink);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary/10 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Create <span className="text-primary">Public Link</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Generate a shareable link for your resume. Control privacy settings, 
              customize the URL, and track engagement with built-in analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">Create Link</TabsTrigger>
                <TabsTrigger value="share">Share Options</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Link Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Link Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="custom-slug">Custom URL Slug</Label>
                        <div className="flex">
                          <span className="flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 rounded-l-md">
                            resumebuilder.com/resume/
                          </span>
                          <Input
                            id="custom-slug"
                            placeholder="your-name-title"
                            value={customSlug}
                            onChange={(e) => setCustomSlug(e.target.value)}
                            className="rounded-l-none"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Leave empty to auto-generate from your name
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Make Public</Label>
                          <p className="text-xs text-muted-foreground">Allow search engines to index</p>
                        </div>
                        <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Allow Downloads</Label>
                          <p className="text-xs text-muted-foreground">Let viewers download PDF</p>
                        </div>
                        <Switch checked={allowDownload} onCheckedChange={setAllowDownload} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show Analytics</Label>
                          <p className="text-xs text-muted-foreground">Display view count to visitors</p>
                        </div>
                        <Switch checked={showAnalytics} onCheckedChange={setShowAnalytics} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expiration">Link Expiration (days)</Label>
                        <Input
                          id="expiration"
                          type="number"
                          placeholder="30"
                          value={expirationDays}
                          onChange={(e) => setExpirationDays(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave empty for permanent link
                        </p>
                      </div>

                      <Button onClick={generateLink} className="w-full">
                        <Link2 className="w-4 h-4 mr-2" />
                        Generate Link
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Generated Link Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Generated Link
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {generatedLink ? (
                        <>
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm font-mono break-all">{generatedLink}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => copyToClipboard(generatedLink)}
                              className="flex-1"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.open(generatedLink, '_blank')}
                              className="flex-1"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Status:</span>
                              <Badge variant={isPublic ? "default" : "secondary"}>
                                {isPublic ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                                {isPublic ? 'Public' : 'Private'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Downloads:</span>
                              <Badge variant="outline">
                                {allowDownload ? 'Allowed' : 'Disabled'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Expires:</span>
                              <Badge variant="outline">
                                {expirationDays ? `${expirationDays} days` : 'Never'}
                              </Badge>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Configure your settings and click "Generate Link"
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="share" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Share Your Resume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedLink ? (
                      <div className="space-y-6">
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-mono break-all">{generatedLink}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Button variant="outline" onClick={shareViaEmail}>
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </Button>
                          <Button variant="outline" onClick={() => shareOnSocial('linkedin')}>
                            <Linkedin className="w-4 h-4 mr-2" />
                            LinkedIn
                          </Button>
                          <Button variant="outline" onClick={() => shareOnSocial('twitter')}>
                            <Twitter className="w-4 h-4 mr-2" />
                            Twitter
                          </Button>
                          <Button variant="outline" onClick={() => shareOnSocial('whatsapp')}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-3">QR Code</h4>
                          <div className="flex items-center justify-center p-6 bg-white border-2 border-dashed border-muted-foreground rounded-md">
                            <div className="text-center">
                              <QrCode className="w-24 h-24 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">QR Code Preview</p>
                              <Button variant="outline" size="sm" className="mt-2">
                                Generate QR Code
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Generate a link first to access sharing options
                        </p>
                        <Button variant="outline" className="mt-4" onClick={() => {
                          const createTab = document.querySelector('[value="create"]') as HTMLElement;
                          createTab?.click();
                        }}>
                          Go to Create Link
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Link Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <div className="text-2xl font-bold text-primary">127</div>
                          <div className="text-sm text-muted-foreground">Total Views</div>
                        </div>
                        <div className="p-4 bg-secondary/5 rounded-lg">
                          <div className="text-2xl font-bold text-secondary-foreground">23</div>
                          <div className="text-sm text-muted-foreground">Downloads</div>
                        </div>
                        <div className="p-4 bg-accent/5 rounded-lg">
                          <div className="text-2xl font-bold text-accent-foreground">8</div>
                          <div className="text-sm text-muted-foreground">Shares</div>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        Analytics will appear here once your link is active and being viewed.
                      </p>
                      <Button variant="outline">
                        View Detailed Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreatePublicLink;