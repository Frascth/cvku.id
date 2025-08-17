
import React from 'react';
import { IndustryTemplates } from '../components/IndustryTemplates';
import { TemplateSelector } from '../components/TemplateSelector';
import { Header } from '../components/Header';

const Templates: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Resume Templates</h1>
            <p className="text-muted-foreground">
              Choose from our collection of professional templates designed for different industries and career levels.
            </p>
          </div>
          <div className="space-y-8">
            <TemplateSelector />
            <IndustryTemplates />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;
