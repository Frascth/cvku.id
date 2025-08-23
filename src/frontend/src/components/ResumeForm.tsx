import React, { useEffect } from "react";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { WorkExperienceForm } from "./forms/WorkExperienceForm";
import { EducationForm } from "./forms/EducationForm";
import { SkillsForm } from "./forms/SkillsForm";
import { CertificationsForm } from "./forms/CertificationsForm";
import { CustomSectionForm } from "./CustomSectionForm";
import { SocialSharingSection } from "./SocialSharingSection";
import { ATSOptimization } from "./ATSOptimization";
import { ResumeScore } from "./ResumeScore";
import {
  PersonalInfo,
  CoverLetterBuilder,
  CoverLetterEditor,
  Certification,
  CustomSection,
  Education,
  Skill,
  SocialLink,
  useResumeStore,
  WorkExperience,
  ResumeData,
  ResumeLink,
} from "@/store/useResumeStore";
import { useAuth } from "@/hooks/use-auth";
import { CoverLetterBuilder as CoverLetterBuilderComponent } from "./CoverLetterBuilder";

export const ResumeForm: React.FC = () => {
  const {
    initialResumeData,
    updateResume,
    resumeHandler,
    personalInfoHandler,
    workExperienceHandler,
    educationHandler,
    skillsHandler,
    certificationHandler,
    customSectionHandler,
    socialHandler,
    coverLetterHandler,
  } = useResumeStore();

  const { authClient, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchResume = async () => {
      try {
        let patch: ResumeData = initialResumeData;

        if (isAuthenticated) {
          const [
            personalInfo,
            workExps,
            edus,
            skills,
            certs,
            customSections,
            socialLinks,
            coverLetterBuilder,
            coverLetterEditor,
            resumeLink,
          ]: [
            PersonalInfo,
            WorkExperience[],
            Education[],
            Skill[],
            Certification[],
            CustomSection[],
            SocialLink[],
            CoverLetterBuilder,
            CoverLetterEditor,
            ResumeLink
          ] = await Promise.all([
            personalInfoHandler.clientGet(),
            workExperienceHandler.clientGetAll(),
            educationHandler.clientGetAll(),
            skillsHandler.clientGetAll(),
            certificationHandler.clientGetAll(),
            customSectionHandler.clientGetAll(),
            socialHandler.clientGetAll(),
            coverLetterHandler.clientGetBuilder(),
            coverLetterHandler.clientGetEditor(),
            resumeHandler.clientGetResumeLink(),
          ]);

          patch = {
            personalInfo: personalInfo ?? {
              fullName: "",
              email: "",
              phone: "",
              location: "",
              website: "",
              bio: "",
            },
            workExperience: workExps ?? [],
            education: edus ?? [],
            skills: skills ?? [],
            certifications: certs ?? [],
            coverLetterBuilder: {
              ...{
                id: "",
                recipientName: "",
                companyName: "",
                jobTitle: "",
                jobDescription: "",
                tone: "professional",
              },
              ...(coverLetterBuilder ?? {}),
            },
            coverLetterEditor: {
              ...{
                id: "",
                introduction: "",
                body: "",
                conclusion: "",
              },
              ...(coverLetterEditor ?? {}),
            },
            socialLinks: socialLinks ?? [],
            customSections: customSections ?? [],
            resumeLink: {
              ...{
                lid: "",
                id: "",
                path: "",
                isPublic: true,
              },
              ...(resumeLink ?? {}),
            },
          };
        }

        updateResume(patch);
      } catch (error) {
        console.error("Failed to fetch resume", error);
      }
    };

    fetchResume();
  }, [isAuthenticated]);

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
      <CoverLetterBuilderComponent />
      <SocialSharingSection />
    </div>
  );
};
