
import React from 'react';
import { SkillsAssessment } from '../components/SkillsAssessment';
import { Header } from '../components/Header';

const Assessment: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Skills Assessment</h1>
            <p className="text-muted-foreground">
              Validate your skills with comprehensive assessments and earn certificates to showcase your expertise.
            </p>
          </div>
          <SkillsAssessment />
        </div>
      </div>
    </div>
  );
};

export default Assessment;
