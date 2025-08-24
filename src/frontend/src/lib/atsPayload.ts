// lib/atsPayload.ts
import type { ResumeData, Skill as FESkill } from "@/store/useResumeStore";

// Import tipe BE dari deklarasi DFX ATS
import type {
  Resume as BEResume,
  SkillLevel as BESkillLevel,
  WorkExperience as BEWork,
  Education as BEEdu,
  SocialLink as BESocial,
  CustomSection as BESection,
  CustomSectionItem as BEItem,
} from "../../../declarations/ats_service/ats_service.did";

// helper: string? -> [] | [string]
const opt = (s?: string): [] | [string] =>
  s && s.trim().length > 0 ? [s] : [];

// helper: any -> bigint (fallback 0)
const toBig = (v: string | number | bigint | undefined): bigint => {
  if (typeof v === "bigint") return v;
  if (typeof v === "number") return BigInt(v);
  if (typeof v === "string" && v !== "") return BigInt(v);
  return 0n;
};

// FE "Beginner" | "Intermediate" | "Advanced" | "Expert" -> BE variant
const toLevel = (l: FESkill["level"]): BESkillLevel =>
  ({ [l]: null } as unknown as BESkillLevel);

export function buildAtsPayload(data: ResumeData): BEResume {
  const work: BEWork[] = data.workExperience.map((w) => ({
    id: toBig(w.id),
    jobTitle: w.jobTitle,
    company: w.company,
    startDate: w.startDate,
    endDate: w.endDate,
    current: w.current,
    description: w.description,
  }));

  const edu: BEEdu[] = data.education.map((e) => ({
    id: toBig(e.id),
    degree: e.degree,
    institution: e.institution,
    graduationDate: e.graduationDate,
    gpa: opt(e.gpa),
    description: e.description,
  }));

  const skills = data.skills.map((s) => ({
    id: s.id,            // BE: string
    name: s.name,
    level: toLevel(s.level),
  }));

  const socials: BESocial[] = data.socialLinks.map((s) => ({
    id: toBig(s.id),
    platform: s.platform,
    url: s.url,
  }));

  const sections: BESection[] = data.customSections.map((sec) => ({
    id: toBig(sec.id),
    name: sec.name,
    items: sec.items.map<BEItem>((it) => ({
      id: toBig(it.id),
      sectionId: toBig(it.sectionId),
      title: it.title,
      description: it.description,
      subtitle: opt(it.subtitle),
      date: opt(it.date),
    })),
  }));

  return {
    personalInfo: {
      fullName: data.personalInfo.fullName,
      email: data.personalInfo.email,
      phone: data.personalInfo.phone,
      location: data.personalInfo.location,
      website: data.personalInfo.website,
      bio: data.personalInfo.bio,
      photoUrl: opt(data.personalInfo.photoUrl),
    },
    workExperience: work,
    education: edu,
    skills,
    certifications: data.certifications.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      date: c.date,
      credentialId: opt(c.credentialId),
    })),
    socialLinks: socials,
    customSections: sections,
  };
}
