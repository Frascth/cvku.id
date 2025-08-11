// src/frontend/src/lib/atsHandler.ts

import { ats_service } from "../../../declarations/ats_service";
import { useResumeStore } from "@/store/useResumeStore";
import { ResumeData, ATSReport } from "@/lib/Type";

export async function getATSReport(): Promise<ATSReport> {
  const resumeData = useResumeStore.getState().resumeData;

  // Lakukan penyesuaian data agar cocok dengan backend
  const dataForBackend = {
    ...resumeData,
    personalInfo: {
      ...resumeData.personalInfo,
      title: (resumeData.personalInfo as any).title || "",
      address: (resumeData.personalInfo as any).address || "",
      photoUrl: (resumeData.personalInfo as any).photoUrl || null,
    },
    workExperience: resumeData.workExperience.map(exp => ({
        ...exp,
        id: (exp as any).id || crypto.randomUUID(),
        current: (exp as any).current || false,
    })),
    education: resumeData.education.map(edu => ({
      ...edu,
      id: (edu as any).id || crypto.randomUUID(),
      institution: (edu as any).institution || "",
      graduationDate: (edu as any).graduationDate || "",
      gpa: (edu as any).gpa || null,
    })),
    skills: resumeData.skills.map(skill => ({
      ...skill,
      id: (skill as any).id || crypto.randomUUID(),
      level: (skill as any).level || "Beginner",
    })),
    // PERBAIKAN AKHIR DI SINI
    certifications: resumeData.certifications.map(cert => {
      const credentialId = (cert as any).credentialId;
      let formattedCredentialId: [] | [string];
      if (typeof credentialId === 'string' && credentialId.trim().length > 0) {
        formattedCredentialId = [credentialId];
      } else {
        formattedCredentialId = [];
      }

      return {
        ...cert,
        id: (cert as any).id || crypto.randomUUID(),
        credentialId: formattedCredentialId,
      };
    }),
    socialLinks: resumeData.socialLinks.map(link => ({
      ...link,
      id: (link as any).id || crypto.randomUUID(),
    })),
    customSections: resumeData.customSections.map(section => ({
      ...section,
      id: (section as any).id || crypto.randomUUID(),
      items: section.items.map(item => ({
        ...item,
        id: (item as any).id || crypto.randomUUID(),
        sectionId: (item as any).sectionId || crypto.randomUUID(),
        subtitle: (item as any).subtitle || null,
        date: (item as any).date || null,
      })),
    })),
  };

  try {
    const resultFromBackend = await ats_service.analyzeResume(dataForBackend);

    const finalReport: ATSReport = {
      score: Number(resultFromBackend.score),
      categories: resultFromBackend.categories,
    };
    
    return finalReport;
  } catch (err) {
    console.error("Error fetching ATS report:", err);
    throw err;
  }
}