
import React from 'react';
import { PersonalInfoForm } from './forms/PersonalInfoForm';
import { WorkExperienceForm } from './forms/WorkExperienceForm';
import { EducationForm } from './forms/EducationForm';
import { SkillsForm } from './forms/SkillsForm';
import { CertificationsForm } from './forms/CertificationsForm';
import { CustomSectionForm } from './CustomSectionForm';
import { SocialSharingSection } from './SocialSharingSection';
import { ATSOptimization } from './ATSOptimization';
import { ResumeScore } from './ResumeScore';
import { CoverLetterBuilder } from './CoverLetterBuilder';

export const ResumeForm: React.FC = () => {
  return (
    <div className="space-y-6">
      <PersonalInfoForm />
      <WorkExperienceForm />
      <EducationForm />
      <SkillsForm />
      <CertificationsForm />
      <CustomSectionForm />
      <ATSOptimization />
      <ResumeScore />
      <CoverLetterBuilder />
      <SocialSharingSection />
    </div>
  );
};
