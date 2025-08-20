// useResumeStore.ts
import { create, StateCreator } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { AuthClient } from "@dfinity/auth-client";
import { createCertificationHandler } from "../lib/certificationHandler";
import { createSkillsHandler } from "../lib/skillsHandler";
import { isValidUrl } from "@/lib/utils";

/* =========================
 * Types
 * ========================= */
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

// FE-only types (untuk Resume Score)
export type ScorePriority = "High" | "Medium" | "Low";
export interface ScoreCategoryFE {
  name: string;
  score: number;
  maxScore: number;
  suggestions: string[];
}
export interface ImprovementFE {
  title: string;
  description: string;
  example: string;
  priority: ScorePriority;
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  bio: string;
  photoUrl?: string;
}

export interface WorkExperience {
  lid?: string; // local id for optimistic update
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  graduationDate: string;
  gpa?: string;
}

export interface Skill {
  id: string; // text
  name: string;
  level: SkillLevel;
}

export interface Certification {
  id: string; // text
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface SocialLink {
  lid?: string; // local id for optimistic update
  id: string;
  platform: string;
  url: string;
}

export interface CustomSectionItem {
  lid?: string, // local id for optimistic update
  id: string;
  sectionId: string;
  title: string;
  subtitle?: string;
  description: string;
  date?: string;
}

export interface CustomSection {
  lid?: string, // local id for optimistic update
  id: string;
  name: string;
  items: CustomSectionItem[];
}

export interface ResumeLink {
  lid?: string, // local id for optimistic update
  id: string;
  path: string;
  isPublic: boolean;
}

export interface CoverLetterBuilder {
  id: string;
  recipientName: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  tone: string;
};

export interface CoverLetterEditor {
  id: string;
  introduction: string;
  body: string;
  conclusion: string;
};

export interface ResumeData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  coverLetterBuilder: CoverLetterBuilder;
  coverLetterEditor: CoverLetterEditor;
  socialLinks: SocialLink[];
  customSections: CustomSection[];
  resumeLink?: ResumeLink;
}

export interface ATSCheck { name: string; passed: boolean; tip: string }
export interface ATSCategory { category: string; checks: ATSCheck[] }

export interface ResumeStore {
  resumeData: ResumeData;
  selectedTemplate: "minimal" | "modern" | "professional";
  isPrivate: boolean;
  hasHydrated: boolean;
  currentPrincipal: string | null;

  // --- ATS report ---
  atsScore: number | null;
  atsCategories: ATSCategory[];
  setAtsReport: (r: { score: number; categories: ATSCategory[] }) => void;
  clearAts: () => void;

  // --- Resume Score ---
  resumeScoreOverall: number | null;
  resumeScoreCategories: ScoreCategoryFE[];
  resumeScoreImprovements: ImprovementFE[];
  setResumeScore: (r: {
    overall: number;
    categories: ScoreCategoryFE[];
    improvements: ImprovementFE[];
  }) => void;
  clearResumeScore: () => void;

  // handlers
  certificationHandler: ReturnType<typeof createCertificationHandler> | null;
  skillsHandler: ReturnType<typeof createSkillsHandler> | null;
  initializeHandlers: (authClient: AuthClient) => void;

  // Skills
  setSkills: (skills: Skill[]) => void;
  addSkill: (skill: Omit<Skill, "id"> | Skill) => void;
  updateSkill: (id: string, patch: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  fetchSkills: () => Promise<void>;
  saveAllSkills: () => Promise<void>;

  // Certifications
  fetchCertifications: () => Promise<void>;
  saveAllCertifications: () => Promise<void>;
  addCertification: (cert: Omit<Certification, "id">) => Promise<void>;
  updateCertification: (id: string, cert: Partial<Omit<Certification, "id">>) => void;
  removeCertification: (id: string) => Promise<void>;

  // Personal info
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  isPersonalInfoFilled: () => boolean;
  resetPersonalInfo: () => void;

  // Work experience
  setWorkExperience: (experiences: WorkExperience[]) => void;
  addWorkExperience: (experience: WorkExperience) => void;
  updateWorkExperienceId: (lid: string, id: string) => void;
  updateWorkExperience: (id: string, experience: Partial<WorkExperience>) => void;
  removeWorkExperience: (id: string) => void;
  setEducation: (experiences: Education[]) => void;
  addEducation: (education: Education) => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addSocialLink: (socialLink: Omit<SocialLink, 'id'>) => void;
  setSocialLink: (params: { socialLinks: SocialLink[] }) => void;
  updateSocialLink: (id: string, socialLink: Partial<SocialLink>) => void;
  updateSocialLinkId: (params: { lid: string, id: string }) => void;
  removeSocialLink: (id: string) => void;
  setCustomSection: (params: { sections: CustomSection[] }) => void;
  addCustomSection: (section: Omit<CustomSection, 'id'>) => void;
  updateCustomSectionId: (lid: string, id: string) => void;
  updateCustomSection: (id: string, section: Partial<CustomSection>) => void;
  removeCustomSection: (id: string) => void;
  addCustomSectionItem: (item: CustomSectionItem) => void;
  updateCustomSectionItemId: (params: { sectionId: string, lid: string, newId: string }) => void;
  setResumeLink: (params: { resumeLink: ResumeLink }) => void;
  updateResumeLinkId: (params: { lid: string, id: string }) => void;
  getResumeLinkUrl: () => string;

  // Cover letter
  setCoverLetterBuilder: (builder: CoverLetterBuilder) => void;
  setCoverLetterEditor: (editor: CoverLetterEditor) => void;

  // misc
  setTemplate: (template: "minimal" | "modern" | "professional") => void;
  setPrivacy: (isPrivate: boolean) => void;
}

/* =========================
 * Initial state
 * ========================= */
const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    bio: "",
  },
  workExperience: [],
  education: [],
  skills: [],
  certifications: [],
  coverLetterBuilder: {
    id: '',
    recipientName: '',
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    tone: '',
  },
  coverLetterEditor: {
    id: '',
    introduction: '',
    body: '',
    conclusion: '',
  },
  socialLinks: [],
  customSections: [],
  resumeLink: {
    lid: '',
    id: '',
    path: '',
    isPublic: true,
  },
};

// (opsional) helper tak terpakai, aman dibiarkan
const mergeById = <T extends { id: string }>(local: T[], server: T[]) => {
  const map = new Map<string, T>();
  for (const s of local) map.set(s.id, s);
  for (const s of server) map.set(s.id, s);
  return Array.from(map.values());
};

/* =========================
 * Creator (tanpa middleware tags)
 * ========================= */
type SC = StateCreator<ResumeStore, [], []>;

const createStoreImpl: SC = (set, get) => ({
  // ===== default state =====
  resumeData: initialResumeData,
  selectedTemplate: "modern",
  isPrivate: false,
  certificationHandler: null,
  skillsHandler: null,
  hasHydrated: false,
  currentPrincipal: null,

  // ===== ATS =====
  atsScore: null,
  atsCategories: [],
  setAtsReport: ({ score, categories }) =>
    set((s) => ({ ...s, atsScore: score, atsCategories: categories })),
  clearAts: () =>
    set((s) => ({ ...s, atsScore: null, atsCategories: [] })),

  // ===== Resume Score =====
  resumeScoreOverall: null,
  resumeScoreCategories: [],
  resumeScoreImprovements: [],
  setResumeScore: ({ overall, categories, improvements }) =>
    set((s) => ({
      ...s,
      resumeScoreOverall: overall,
      resumeScoreCategories: categories,
      resumeScoreImprovements: improvements,
    })),
  clearResumeScore: () =>
    set((s) => ({
      ...s,
      resumeScoreOverall: null,
      resumeScoreCategories: [],
      resumeScoreImprovements: [],
    })),

  // ===== handlers init =====
  initializeHandlers: (authClient) => {
    try {
      const pid = authClient.getIdentity().getPrincipal().toText();
      const prev = get().currentPrincipal;

      // principal berubah → bersihkan state per-user
      if (!prev || prev !== pid) {
        set((state) => ({
          ...state,
          currentPrincipal: pid,
          atsScore: null,
          atsCategories: [],
          resumeScoreOverall: null,
          resumeScoreCategories: [],
          resumeScoreImprovements: [],
          resumeData: {
            ...state.resumeData,
            skills: [],
            // jika ingin, kosongkan koleksi lain juga saat ganti akun:
            // certifications: [], socialLinks: [], customSections: []
          },
        }));
      }

      // set handlers
      set({
        certificationHandler: createCertificationHandler(authClient),
        skillsHandler: createSkillsHandler(authClient),
      });

      // fetch data server untuk principal ini (handler sudah siap)
      void get().fetchSkills?.();
      void get().fetchCertifications?.();
    } catch (error) {
      console.error("Failed to initialize handlers:", error);
    }
  },

  /* =========================
   * Skills
   * ========================= */
  setSkills: (skills) =>
    set((state) => ({ resumeData: { ...state.resumeData, skills } })),

  fetchSkills: async () => {
    const handler = get().skillsHandler;
    if (!handler) throw new Error("Skills handler not initialized.");
    try {
      const fetched = await handler.clientGetAll(); // Skill[]
      set((state) => ({
        resumeData: { ...state.resumeData, skills: fetched },
      }));
    } catch (err) {
      console.error("Failed to fetch skills:", err);
      throw err;
    }
  },

  saveAllSkills: async () => {
    const handler = get().skillsHandler;
    if (!handler) throw new Error("Skills handler not initialized.");
    try {
      const saved = await handler.clientSave(get().resumeData.skills); // Skill[]
      set((state) => ({
        resumeData: { ...state.resumeData, skills: saved },
      }));
    } catch (err) {
      console.error("Failed to save all skills:", err);
      throw err;
    }
  },

  addSkill: async (skill) => {
    const handler = get().skillsHandler;
    if (!handler) throw new Error("Skills handler not initialized.");
    try {
      const newSkill = await handler.clientAdd(
        "id" in skill ? { name: skill.name, level: skill.level } : skill
      );
      set((state) => ({
        resumeData: {
          ...state.resumeData,
          skills: [...state.resumeData.skills, newSkill],
        },
      }));
    } catch (err) {
      console.error("Failed to add skill:", err);
      throw err;
    }
  },

  updateSkill: (id, patch) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        skills: state.resumeData.skills.map((s) =>
          s.id === id ? { ...s, ...patch } : s
        ),
      },
    })),

  removeSkill: async (id) => {
    const handler = get().skillsHandler;
    if (!handler) throw new Error("Skills handler not initialized.");
    try {
      const ok = await handler.clientDeleteById(id);
      if (!ok) throw new Error("Backend reported failure to delete skill.");
      set((state) => ({
        resumeData: {
          ...state.resumeData,
          skills: state.resumeData.skills.filter((s) => s.id !== id),
        },
      }));
    } catch (err) {
      console.error("Failed to remove skill:", err);
      throw err;
    }
  },

  /* =========================
   * Certifications
   * ========================= */
  fetchCertifications: async () => {
    const handler = get().certificationHandler;
    if (!handler) throw new Error("Certification handler not initialized.");
    try {
      const fetched = await handler.clientGetAll();
      set((state) => ({
        resumeData: { ...state.resumeData, certifications: fetched as Certification[] },
      }));
    } catch (error) {
      console.error("Failed to fetch certifications:", error);
      throw error;
    }
  },

  saveAllCertifications: async () => {
    const handler = get().certificationHandler;
    if (!handler) throw new Error("Certification handler not initialized.");
    try {
      await handler.clientSave(get().resumeData.certifications);
    } catch (error) {
      console.error("Failed to save all certifications:", error);
      throw error;
    }
  },

  addCertification: async (cert) => {
    const handler = get().certificationHandler;
    if (!handler) throw new Error("Certification handler not initialized.");
    try {
      const newCert = await handler.clientAdd(cert);
      set((state) => ({
        resumeData: {
          ...state.resumeData,
          certifications: [...state.resumeData.certifications, newCert],
        },
      }));
    } catch (error) {
      console.error("Failed to add certification:", error);
      throw error;
    }
  },

  updateCertification: (id, patch) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        certifications: state.resumeData.certifications.map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      },
    })),

  removeCertification: async (id) => {
    const handler = get().certificationHandler;
    if (!handler) throw new Error("Certification handler not initialized.");
    try {
      const ok = await handler.clientDeleteById(id);
      if (!ok) throw new Error("Backend reported failure to delete certification.");
      set((state) => ({
        resumeData: {
          ...state.resumeData,
          certifications: state.resumeData.certifications.filter((c) => c.id !== id),
        },
      }));
    } catch (error) {
      console.error("Failed to remove certification:", error);
      throw error;
    }
  },

  /* =========================
   * Personal Info
   * ========================= */
  updatePersonalInfo: (info) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        personalInfo: { ...state.resumeData.personalInfo, ...info },
      },
    })),

  isPersonalInfoFilled: () => {
    const { fullName, email, phone, location, website, bio } = get().resumeData.personalInfo;
    return !!(fullName && email && phone && location && website && bio);
  },

  resetPersonalInfo: () =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        personalInfo: {
          fullName: "",
          email: "",
          phone: "",
          location: "",
          website: "",
          bio: "",
          photoUrl: "",
        },
      },
    })),

  /* =========================
   * Work Experience
   * ========================= */
  setWorkExperience: (experiences) =>
    set((state) => ({ resumeData: { ...state.resumeData, workExperience: experiences } })),

  addWorkExperience: (experience) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        workExperience: [...state.resumeData.workExperience, experience],
      },
    })),

  updateWorkExperienceId: (lid, id) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        workExperience: state.resumeData.workExperience.map((exp) =>
          exp.lid === lid ? { ...exp, id: id } : exp
        ),
      },
    })),

  updateWorkExperience: (id, experience) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        workExperience: state.resumeData.workExperience.map((exp) =>
          exp.id === id ? { ...exp, ...experience } : exp
        ),
      },
    })),

  removeWorkExperience: (id) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        workExperience: state.resumeData.workExperience.filter((exp) => exp.id !== id),
      },
    })),

  /* =========================
   * Education
   * ========================= */
  setEducation: (educations) =>
    set((state) => ({ resumeData: { ...state.resumeData, education: educations } })),

  addEducation: (education) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        education: [...state.resumeData.education, education],
      },
    })),

  updateEducation: (id, patch) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        education: state.resumeData.education.map((edu) =>
          edu.id === id ? { ...edu, ...patch } : edu
        ),
      },
    })),

  removeEducation: (id) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        education: state.resumeData.education.filter((edu) => edu.id !== id),
      },
    })),

  /* =========================
   * Social Links
   * ========================= */
  addSocialLink: (socialLink) =>
    set((state) => {

      if (!isValidUrl(socialLink.url)) {
        throw new Error(`Please provide a valid url`);
      }

      return {
        resumeData: {
          ...state.resumeData,
          socialLinks: [
            ...state.resumeData.socialLinks,
            { ...socialLink, id: crypto.randomUUID() },
          ],
        },
      }

    }),

  setSocialLink: ({ socialLinks }) =>
    set((state) => ({ resumeData: { ...state.resumeData, socialLinks } })),

  updateSocialLink: (id, patch) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        socialLinks: state.resumeData.socialLinks.map((link) =>
          link.id === id ? { ...link, ...patch } : link
        ),
      },
    })),

  updateSocialLinkId: ({ lid, id }) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        socialLinks: state.resumeData.socialLinks.map((link) =>
          link.lid === lid ? { ...link, id: id } : link
        ),
      },
    })),

  removeSocialLink: (id) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        socialLinks: state.resumeData.socialLinks.filter((l) => l.id !== id),
      },
    })),

  /* =========================
   * Custom Sections
   * ========================= */
  setCustomSection: ({ sections }) =>
    set((state) => ({ resumeData: { ...state.resumeData, customSections: sections } })),

  addCustomSection: (section) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        customSections: [
          ...state.resumeData.customSections,
          { ...section, id: crypto.randomUUID() },
        ],
      },
    })),


  updateCustomSectionId: (lid, newId) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        customSections: state.resumeData.customSections.map((section) =>
          section.lid === lid ? { ...section, id: newId } : section
        ),
      },
    })),

  updateCustomSection: (id, section) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        customSections: state.resumeData.customSections.map((s) =>
          s.id === id ? { ...s, ...section } : s
        ),
      },
    })),

  removeCustomSection: (id) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        customSections: state.resumeData.customSections.filter((s) => s.id !== id),
      },
    })),

  addCustomSectionItem: (item) => {
    set((state) => {

      const sectionIndex = state.resumeData.customSections.findIndex((section) => section.id === item.sectionId);

      if (sectionIndex === -1) {
        throw new Error(`Custom section with id "${item.sectionId}" not found.`);
      }

      const section = state.resumeData.customSections[sectionIndex];

      const updatedItems = [...section.items, item];

      const updatedSection = {
        ...section,
        items: updatedItems,
      };

      const updatedSections = [...state.resumeData.customSections];

      updatedSections[sectionIndex] = updatedSection;

      return {
        resumeData: {
          ...state.resumeData,
          customSections: updatedSections
        },
      };
    });
  },

  updateCustomSectionItemId: ({ sectionId, lid, newId }) => {
    set((state) => {

      const sectionIndex = state.resumeData.customSections.findIndex((section) => section.id === sectionId);

      if (sectionIndex === -1) {
        throw new Error(`Custom section with id "${sectionId}" not found.`);
      }

      const section = state.resumeData.customSections[sectionIndex];

      const itemIndex = section.items.findIndex((item) => item.lid === lid);

      if (itemIndex === -1) {
        throw new Error(`Item with id "${itemIndex}" not found.`);
      }

      const updatedItems = [...section.items];

      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        id: newId
      };

      const updatedSection = {
        ...section,
        items: updatedItems,
      };

      const updatedSections = [...state.resumeData.customSections];

      updatedSections[sectionIndex] = updatedSection;

      return {
        resumeData: {
          ...state.resumeData,
          customSections: updatedSections
        },
      };
    });
  },

  getResumeLinkUrl: () => {
    const path = get().resumeData.resumeLink?.path;

    if (!path) {
      return '';
    }

    return `${window.location.origin}/resume/${path}`;
  },

  setResumeLink: ({ resumeLink }) =>
    set((state) => ({ resumeData: { ...state.resumeData, resumeLink } })),

  updateResumeLinkId: ({ lid, id }) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        resumeLink: { ...state.resumeData.resumeLink, id },
      },
    })),

  /* =========================
   * Cover Letter
   * ========================= */
  setCoverLetterBuilder: (builder) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        coverLetterBuilder: { ...builder },
      },
    })),

  setCoverLetterEditor: (editor) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        coverLetterEditor: { ...editor },
      },
    })),

  /* =========================
   * misc
   * ========================= */
  setTemplate: (template) => set({ selectedTemplate: template }),
  setPrivacy: (isPrivate) => set({ isPrivate }),
});

/* =========================
 * Persisted slice typing
 * ========================= */
type PersistedSlice = Pick<
  ResumeStore,
  | "resumeData"
  | "selectedTemplate"
  | "isPrivate"
  | "currentPrincipal"
  | "atsScore"
  | "atsCategories"
  | "resumeScoreOverall"
  | "resumeScoreCategories"
  | "resumeScoreImprovements"
>;

/* =========================
 * Export store (devtools + persist)
 * ========================= */
export const useResumeStore = create<ResumeStore>()(
  devtools(
    persist<ResumeStore, [], [], PersistedSlice>(createStoreImpl, {
      name: "resume-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s): PersistedSlice => ({
        resumeData: s.resumeData,
        selectedTemplate: s.selectedTemplate,
        isPrivate: s.isPrivate,
        currentPrincipal: s.currentPrincipal,
        atsScore: s.atsScore,
        atsCategories: s.atsCategories,
        resumeScoreOverall: s.resumeScoreOverall,
        resumeScoreCategories: s.resumeScoreCategories,
        resumeScoreImprovements: s.resumeScoreImprovements,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) {
          state.hasHydrated = true;

          // safety default utk versi lama
          if (state.atsScore === undefined) state.atsScore = null;
          if (!state.atsCategories) state.atsCategories = [];
          if (state.resumeScoreOverall === undefined) state.resumeScoreOverall = null;
          if (!state.resumeScoreCategories) state.resumeScoreCategories = [];
          if (!state.resumeScoreImprovements) state.resumeScoreImprovements = [];
          if (state.currentPrincipal === undefined) state.currentPrincipal = null;

          // ⛔️ Jangan fetch di sini (handlers belum di-init).
          // Fetch dilakukan di initializeHandlers setelah handler tersedia.
        }
      },
    })
  )
);
