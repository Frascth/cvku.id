
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Crown, Star, Zap, Download, FileText, Palette, Shield, BarChart3, Users, Calendar, Bell, Clock, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PremiumFeatures: React.FC = () => {
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumSettings, setPremiumSettings] = useState({
    aiOptimization: false,
    advancedTemplates: false,
    unlimitedDownloads: false,
    customDomains: false,
    analytics: false,
    prioritySupport: false,
    collaborativeEditing: false,
    scheduledSharing: false,
    aiRecommendations: false,
    brandingRemoval: false
  });

  const handleUpgrade = () => {
    toast({
      title: "Upgrade to Premium",
      description: "Redirecting to premium subscription page...",
    });
    // Mock premium activation for demo
    setTimeout(() => {
      setIsPremium(true);
      toast({
        title: "Welcome to Premium!",
        description: "You now have access to all premium features.",
      });
    }, 2000);
  };

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "This feature requires a premium subscription.",
        variant: "destructive",
      });
      return;
    }
    
    setPremiumSettings(prev => ({ ...prev, [feature]: enabled }));
    toast({
      title: "Feature Updated",
      description: `${feature} has been ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const premiumFeatures = [
    {
      icon: Zap,
      title: "AI Resume Optimization",
      description: "AI-powered suggestions to improve your resume content and ATS compatibility",
      category: "ai"
    },
    {
      icon: Palette,
      title: "Advanced Templates",
      description: "Access to 15+ premium resume templates with unique designs",
      category: "design"
    },
    {
      icon: Download,
      title: "Unlimited Downloads",
      description: "Download your resume in multiple formats without limits",
      category: "export"
    },
    {
      icon: Shield,
      title: "Custom Domains",
      description: "Host your resume on your own custom domain",
      category: "branding"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Detailed insights on resume views, engagement, and performance",
      category: "analytics"
    },
    {
      icon: Users,
      title: "Collaborative Editing",
      description: "Share resume editing access with mentors or career coaches",
      category: "collaboration"
    },
    {
      icon: Calendar,
      title: "Scheduled Sharing",
      description: "Schedule when your resume becomes available to specific viewers",
      category: "scheduling"
    },
    {
      icon: Target,
      title: "Job Match AI",
      description: "AI recommendations for tailoring your resume to specific jobs",
      category: "ai"
    },
    {
      icon: Bell,
      title: "Priority Support",
      description: "24/7 priority customer support with dedicated assistance",
      category: "support"
    },
    {
      icon: Crown,
      title: "White-Label Branding",
      description: "Remove CvKu.id branding and add your own professional touch",
      category: "branding"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "3 Resume templates",
        "Basic customization",
        "PDF export",
        "Public sharing",
        "Basic privacy controls"
      ],
      current: !isPremium
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "per month",
      features: [
        "15+ Premium templates",
        "AI optimization",
        "Unlimited downloads",
        "Custom domains",
        "Advanced analytics",
        "Priority support",
        "Collaborative editing",
        "White-label branding"
      ],
      popular: true,
      current: isPremium
    },
    {
      name: "Enterprise",
      price: "$29.99",
      period: "per month",
      features: [
        "Everything in Premium",
        "Team management",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "Advanced security",
        "Bulk operations"
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-yellow-600" />
          <span>Premium Features</span>
          {isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">
              <Star className="w-3 h-3 mr-1" />
              Premium Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="features" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-4">
            {!isPremium && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Unlock Premium Features
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Get access to AI optimization, advanced templates, analytics, and more.
                    </p>
                  </div>
                  <Button onClick={handleUpgrade} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {premiumFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${
                      isPremium 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent 
                        className={`w-5 h-5 mt-1 ${
                          isPremium ? 'text-green-600' : 'text-gray-400'
                        }`} 
                      />
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          isPremium ? 'text-green-900' : 'text-gray-900'
                        }`}>
                          {feature.title}
                        </h4>
                        <p className={`text-sm ${
                          isPremium ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {feature.description}
                        </p>
                        {isPremium && (
                          <Badge className="mt-2 bg-green-100 text-green-800">
                            <Star className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`p-6 border rounded-lg relative ${
                    plan.current 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : plan.popular 
                        ? 'border-purple-500 bg-gradient-to-b from-purple-50 to-pink-50 ring-2 ring-purple-200' 
                        : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>
                    
                    <ul className="space-y-2 mb-6 text-sm">
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center">
                          <Star className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${
                        plan.current 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : plan.popular 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                            : 'bg-blue-600'
                      }`}
                      onClick={plan.current ? undefined : handleUpgrade}
                      disabled={plan.current}
                    >
                      {plan.current ? 'Current Plan' : 'Choose Plan'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {!isPremium ? (
              <div className="text-center py-8">
                <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Premium Settings
                </h3>
                <p className="text-gray-600 mb-4">
                  Upgrade to premium to access advanced feature settings.
                </p>
                <Button onClick={handleUpgrade} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold mb-4">Premium Feature Controls</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold">AI Resume Optimization</h4>
                        <p className="text-sm text-gray-600">Get AI-powered suggestions for improvement</p>
                      </div>
                    </div>
                    <Switch
                      checked={premiumSettings.aiOptimization}
                      onCheckedChange={(checked) => handleFeatureToggle('aiOptimization', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold">Advanced Analytics</h4>
                        <p className="text-sm text-gray-600">Track detailed resume performance metrics</p>
                      </div>
                    </div>
                    <Switch
                      checked={premiumSettings.analytics}
                      onCheckedChange={(checked) => handleFeatureToggle('analytics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-purple-600" />
                      <div>
                        <h4 className="font-semibold">Collaborative Editing</h4>
                        <p className="text-sm text-gray-600">Allow others to help edit your resume</p>
                      </div>
                    </div>
                    <Switch
                      checked={premiumSettings.collaborativeEditing}
                      onCheckedChange={(checked) => handleFeatureToggle('collaborativeEditing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Crown className="w-5 h-5 text-yellow-600" />
                      <div>
                        <h4 className="font-semibold">Remove Branding</h4>
                        <p className="text-sm text-gray-600">Hide CvKu.id branding from your resume</p>
                      </div>
                    </div>
                    <Switch
                      checked={premiumSettings.brandingRemoval}
                      onCheckedChange={(checked) => handleFeatureToggle('brandingRemoval', checked)}
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-900">Usage Statistics</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-yellow-700">AI Optimizations Used:</span>
                      <span className="font-semibold ml-2">12/50</span>
                    </div>
                    <div>
                      <span className="text-yellow-700">Premium Downloads:</span>
                      <span className="font-semibold ml-2">8/Unlimited</span>
                    </div>
                    <div>
                      <span className="text-yellow-700">Analytics Views:</span>
                      <span className="font-semibold ml-2">1,247</span>
                    </div>
                    <div>
                      <span className="text-yellow-700">Template Access:</span>
                      <span className="font-semibold ml-2">15/15</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
