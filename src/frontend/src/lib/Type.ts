// src/lib/Type.ts

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

// src/lib/Type.ts

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  bio: string;
  photoUrl?: string | null; // Dibuat opsional
  title?: string;           // Dibuat opsional
  address?: string;         // Dibuat opsional
}

export interface WorkExperience {
  id?: number;              // Dibuat opsional
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  current?: boolean;        // Dibuat opsional
  description: string;
}

export interface Education {
  id?: number;              // Dibuat opsional
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
  gpa?: string | null;      // Dibuat opsional
  institution?: string;     // Dibuat opsional
  graduationDate?: string;  // Dibuat opsional
}

export interface SocialLink {
  id?: number;              // Dibuat opsional
  platform: string;
  url: string;
}

// ... tipe data lainnya tetap sama

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId: string[]; // Ini akan lebih cocok dengan `[] | [string]` dari backend
}

export interface CustomSectionItem {
  sectionId: number;
  id: number;
  title: string;
  description: string;
  subtitle: string | null;
  date: string | null;
}

export interface CustomSection {
  id: number;
  name: string;
  items: CustomSectionItem[];
}

export interface ATSCheck {
  name: string;
  passed: boolean;
  tip: string;
}

export interface ATSCategory {
  category: string;
  checks: ATSCheck[];
}

export interface ATSReport {
  score: number; // Atau bigint, tergantung keputusanmu
  categories: ATSCategory[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  socialLinks: SocialLink[];
  customSections: CustomSection[];
}