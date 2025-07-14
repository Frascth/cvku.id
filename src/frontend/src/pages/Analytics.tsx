
import React from 'react';
import { AnalyticsInsights } from '../components/AnalyticsInsights';
import { Header } from '../components/Header';

const Analytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track your resume performance and get insights into how recruiters interact with your profile.
            </p>
          </div>
          <AnalyticsInsights />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
