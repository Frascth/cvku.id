
import React from 'react';
import { Header } from '../components/Header';
import { ThemeSelector } from '../components/ThemeSelector';
import { AdvancedPrivacySecurity } from '../components/AdvancedPrivacySecurity';
import { DataManagement } from '../components/DataManagement';
import { PremiumFeatures } from '../components/PremiumFeatures';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Palette, Shield, Database, Star } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings, privacy preferences, and premium features.
            </p>
          </div>
          
          <Tabs defaultValue="appearance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Data
              </TabsTrigger>
              <TabsTrigger value="premium" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Premium
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Appearance Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ThemeSelector />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <AdvancedPrivacySecurity />
            </TabsContent>

            <TabsContent value="data">
              <DataManagement />
            </TabsContent>

            <TabsContent value="premium">
              <PremiumFeatures />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
