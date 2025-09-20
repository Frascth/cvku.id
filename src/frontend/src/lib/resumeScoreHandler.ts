// src/frontend/src/lib/resumeScoreHandler.ts
import { createActor, canisterId } from "../../../declarations/resume_score_service";
import type { AuthClient } from "@dfinity/auth-client";

// Import tipe backend dari .did.d.ts canister resume_score_service
import type {
  Resume as BResume,
  SkillLevel as BSkillLevel,
  ResumeScoreReport as BReport,
} from "../../../declarations/resume_score_service/resume_score_service.did";

// Import tipe2 FE kamu
import type { ResumeData, SkillLevel as FESkillLevel } from "@/store/useResumeStore";

// Helper: optional -> [] | [v]
const toMoOpt = (v?: string | null): [] | [string] => (v ? [v] : []);

// Helper: number/string -> bigint
const toBig = (n: number | string): bigint => BigInt(n);

// ⬇️ INI YANG PENTING: mapping string level FE -> variant backend
const toBSkillLevel = (lvl: FESkillLevel): BSkillLevel => {
  switch (lvl) {
    case "Beginner":
      return { Beginner: null };
    case "Intermediate":
      return { Intermediate: null };
    case "Advanced":
      return { Advanced: null };
    case "Expert":
      return { Expert: null };
  }
};

// Konversi Resume FE -> Resume backend
const toBResume = (r: ResumeData): BResume => ({
  personalInfo: {
    fullName: r.personalInfo.fullName,
    email: r.personalInfo.email,
    phone: r.personalInfo.phone,
    location: r.personalInfo.location,
    website: r.personalInfo.website,
    bio: r.personalInfo.bio,
    photoUrl: toMoOpt(r.personalInfo.photoUrl),
  },
  workExperience: r.workExperience.map(w => ({
    id: toBig(w.id),
    jobTitle: w.jobTitle,
    company: w.company,
    startDate: w.startDate,
    endDate: w.endDate,
    current: w.current,
    description: w.description,
  })),
  education: r.education.map(e => ({
    id: toBig(e.id),
    degree: e.degree,
    institution: e.institution,
    graduationDate: e.graduationDate,
    gpa: toMoOpt(e.gpa),
    description: e.description
  })),
  skills: r.skills.map(s => ({
    id: s.id,               // FE: string -> backend: text (OK)
    name: s.name,
    level: toBSkillLevel(s.level), // ⬅️ FIX di sini
  })),
  certifications: r.certifications.map(c => ({
    id: c.id,
    name: c.name,
    issuer: c.issuer,
    date: c.date,
    credentialId: toMoOpt(c.credentialId),
  })),
  socialLinks: r.socialLinks.map(sl => ({
    id: toBig(sl.id),
    platform: sl.platform,
    url: sl.url,
  })),
  customSections: r.customSections.map(sec => ({
    id: toBig(sec.id),
    name: sec.name,
    items: sec.items.map(item => ({
      sectionId: toBig(item.sectionId),
      id: toBig(item.id),
      title: item.title,
      description: item.description,
      subtitle: toMoOpt(item.subtitle),
      date: toMoOpt(item.date),
    })),
  })),
});

export function createResumeScoreHandler(authClient: AuthClient) {
  const actor = createActor(canisterId, {
    agentOptions: { identity: authClient.getIdentity() },
  });

  return {
    analyze: async (resume: ResumeData) => {
      const payload = toBResume(resume);         // ⬅️ kirim yang sudah dikonversi
      const resp = await actor.analyze(payload); // query canister

      // resp bertipe BReport; kamu bisa langsung return atau konversi angka ke number
      const r = resp;
      return {
        overall: Number(r.overall),
        rankPercentile: Number(r.rankPercentile),
        categories: r.categories,   // sudah array of { name; score; maxScore; suggestions }
        improvements: r.improvements,
      };
    },
  };
}
