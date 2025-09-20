// useResumeStore.ts
import { create, StateCreator } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { AuthClient } from "@dfinity/auth-client";
import { createCertificationHandler } from "../lib/certificationHandler";
import { createSkillsHandler } from "../lib/skillsHandler";
import { isValidUrl, isBackendId, isPersistedId, isTempId } from "@/lib/utils";
import { createPersonalInfoHandler } from "@/lib/personalInfoHandler";
import { createWorkExperienceHandler } from "@/lib/workExperienceHandler";
import { createEducationHandler } from "@/lib/educationHandler";
import { createCustomSectionHandler } from "@/lib/customSectionHandler";
import { createSocialHandler } from "@/lib/socialHandler";
import { createCoverLetterHandler } from "@/lib/coverLetterHandler";
import { createAtsHandler } from "@/lib/atsHandler";
import { createResumeScoreHandler } from "@/lib/resumeScoreHandler";
import { createResumeHandler } from "@/lib/resumeHandler";
import { createAssessmentHandler } from "@/lib/assessment/assessmentHandler";
import {
  createAnalyticsHandler,
  type TimeRange,           // "24h" | "7d" | ...
  type Overview,
  type ViewsPoint,
  type DeviceItem,
  type LocationItem,
  type TrafficSourceItem,
  type SectionPerfItem,
  type ActivityItem,
} from "@/lib/analyticsHandler";



type AnalyticsRange = "24h" | "7d" | "30d" | "90d"; // ganti ini

type AnalyticsSlice = {
  analyticsRange: AnalyticsRange;
  overviewStats: Overview | null;
  viewsData: ViewsPoint[];
  deviceData: DeviceItem[];
  locationData: LocationItem[];
  trafficSources: TrafficSourceItem[];
  topSections: SectionPerfItem[];
  recentActivity: ActivityItem[];
  setAnalyticsRange: (r: AnalyticsRange) => void;
  hydrateAnalytics: (resumeId: string) => Promise<void>;
  trackViewStart: (resumeId: string) => void;
  trackViewEnd: (resumeId: string) => void;
  trackShare: (resumeId: string) => void;
  trackDownload: (resumeId: string) => void;
  trackSectionView: (resumeId: string, section: string, durationMs: number) => void;
};


/* =========================
 * Types
 * ========================= */
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type AssessmentLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

const slugify = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "-");



export interface AssessmentResult {
  skillId: string;      // 'javascript', 'react', dst (ID internal assessment)
  skillKey?: string;   // optional, kunci alternatif (misal: skillId di FE) 
  skillName: string;    // 'JavaScript', 'React', dst
  score: number;        // 0..100
  correct: number;
  total: number;
  level: AssessmentLevel;
  dateISO: string;      // ISO date
  testLevel?: AssessmentLevel; // level test yang diambil
}

const assessmentKey = (skillId: string, testLevel?: AssessmentLevel) =>
  testLevel? `${skillId}::${testLevel}` : `${skillId}`;

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
  id: number; // nat
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  lid?: string; // for optimistic update
  id: number;
  degree: string;
  institution: string;
  graduationDate: string;
  gpa?: string;
  description: string;
}

export interface Skill {
  lid?: string; // local id for optimistic update
  id: string; // text
  name: string;
  level: SkillLevel;
  lastAssessmentScore?: number;   // ⬅️ skor terakhir (0–100)
  lastAssessmentLevel?: AssessmentLevel; // ⬅️ level terakhir (opsional)
  lastAssessmentAt?: string;      // ⬅️ timestamp ISO (opsional)
}

export interface Certification {
  lid?: string; // local id for optimistic update
  id: string; // text
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface SocialLink {
  lid?: number; // local-only
  id: number;   // nat
  platform: string;
  url: string;
}

export interface CustomSectionItem {
  lid?: number; // local-only
  id: number;   // nat
  sectionId: number; // nat
  title: string;
  subtitle?: string;
  description: string;
  date?: string;
}

export interface CustomSection {
  lid?: number; // local-only
  id: number;   // nat
  name: string;
  items: CustomSectionItem[];
}

export interface ResumeLink {
  lid?: string;
  id: number;
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
  initialResumeData: ResumeData;
  resumeData: ResumeData;
  selectedTemplate: "minimal" | "modern" | "professional";
  isPrivate: boolean;
  hasHydrated: boolean;
  currentPrincipal: string | null;

  // resume
  updateResume: (patch: Partial<ResumeData>) => void;

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

  // --- Assessment (hasil + badge di Skills) ---
  assessment: Record<string, AssessmentResult>;
  setAssessmentResult: (r: AssessmentResult) => void;
  clearAssessmentForSkill: (skillId: string, testLevel?: AssessmentLevel) => void;
  clearAllAssessments: () => void;
  hasCompletedAssessment: (skillId: string, testLevel?: AssessmentLevel) => boolean;

  analyticsHandler: ReturnType<typeof createAnalyticsHandler> | null;
  analytics: AnalyticsSlice;

  // handlers
  resumeHandler: ReturnType<typeof createResumeHandler> | null;
  personalInfoHandler: ReturnType<typeof createPersonalInfoHandler> | null;
  workExperienceHandler: ReturnType<typeof createWorkExperienceHandler> | null;
  educationHandler: ReturnType<typeof createEducationHandler> | null;
  skillsHandler: ReturnType<typeof createSkillsHandler> | null;
  certificationHandler: ReturnType<typeof createCertificationHandler> | null;
  customSectionHandler: ReturnType<typeof createCustomSectionHandler> | null;
  socialHandler: ReturnType<typeof createSocialHandler> | null;
  coverLetterHandler: ReturnType<typeof createCoverLetterHandler> | null;
  atsHandler: ReturnType<typeof createAtsHandler> | null;
  scoreHandler: ReturnType<typeof createResumeScoreHandler> | null;
  assessmentHandler: ReturnType<typeof createAssessmentHandler> | null;
  initializeHandlers: (authClient: AuthClient) => void;
  areHandlersReady: () => boolean;

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
  updateWorkExperience: (id: number, experience: Partial<WorkExperience>) => void;
  removeWorkExperience: (id: number) => void;
  setEducation: (experiences: Education[]) => void;
  addEducation: (education: Omit<Education, "id">) => void;
  updateEducation: (id: number, education: Partial<Education>) => void;
  updateEducationId: (lid: string, id: number) => void;
  removeEducation: (id: number) => void;
  addSocialLink: (socialLink: Omit<SocialLink, 'id'>) => void;
  setSocialLink: (params: { socialLinks: SocialLink[] }) => void;
  updateSocialLink: (id: number, socialLink: Partial<SocialLink>) => void;
  updateSocialLinkId: (params: { lid: number; id: number }) => void;
  removeSocialLink: (id: number) => void;

  // Custom sections
  setCustomSection: (params: { sections: CustomSection[] }) => void;
  addCustomSection: (section: Omit<CustomSection, "id">) => void;
  updateCustomSectionId: (lid: number, id: number) => void;
  updateCustomSection: (id: number, section: Partial<CustomSection>) => void;
  removeCustomSection: (id: number) => void;
  addCustomSectionItem: (item: CustomSectionItem) => void;
  updateCustomSectionItemId: (params: { sectionId: number; lid: number; newId: number }) => void;

  // Resume link
  setResumeLink: (params: { resumeLink: ResumeLink }) => void;
  updateResumeLinkId: (params: { lid: number; id: number }) => void;
  getResumeLinkUrl: () => string;

  // Cover letter
  // Cover letter (STATE)
  coverLetterBuilder: CoverLetterBuilder;
  coverLetterEditor: CoverLetterEditor;

  // Cover letter (ACTIONS)
  setCoverLetterBuilder: (builder: CoverLetterBuilder) => void;
  updateCoverLetterBuilder: (builder: Partial<CoverLetterBuilder>) => void;
  setCoverLetterEditor: (editor: CoverLetterEditor) => void;
  updateCoverLetterEditor: (editor: Partial<CoverLetterEditor>) => void;

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
    tone: 'professional',
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
    lid: "",
    id: 0,
    path: "",
    isPublic: true,
  },
};

const defaultCoverLetterBuilder: CoverLetterBuilder = {
  id: '',
  recipientName: '',
  companyName: '',
  jobTitle: '',
  jobDescription: '',
  tone: 'professional',
};

const defaultCoverLetterEditor: CoverLetterEditor = {
  id: '',
  introduction: '',
  body: '',
  conclusion: '',
};

// (opsional) helper tak terpakai, aman dibiarkan
const mergeById = <T extends { id: string }>(local: T[], server: T[]) => {
  const map = new Map<string, T>();
  for (const s of local) map.set(s.id, s);
  for (const s of server) map.set(s.id, s);
  return Array.from(map.values());
};

const nextId = (arr: { id: number }[]) =>
  (arr.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1;


const ridKey = "_rid";
const uuid = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
const device = "Web";              // atau "Desktop"
const startKey = "resume-view-start";
const nowSec = () => Math.floor(Date.now() / 1000);

// kalau belum ada
function ensureRid() {
  let rid = localStorage.getItem("rid");
  if (!rid) {
    rid = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    localStorage.setItem("rid", rid);
  }
  return rid;
}

const formatBigInt = (value: bigint | undefined) => (value === undefined ? 0 : Number(value));
const formatMs = (ms: number) => {
    if (ms <= 0) return "0s";
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

/* =========================
 * Creator (tanpa middleware tags)
 * ========================= */
type SC = StateCreator<ResumeStore, [], []>;

const createStoreImpl: SC = (set, get) => ({
  // ===== default state =====
  initialResumeData: initialResumeData,
  resumeData: initialResumeData,
  selectedTemplate: "modern",
  isPrivate: false,
  resumeHandler: null,
  personalInfoHandler: null,
  workExperienceHandler: null,
  educationHandler: null,
  customSectionHandler: null,
  socialHandler: null,
  coverLetterHandler: null,
  certificationHandler: null,
  skillsHandler: null,
  atsHandler: null,
  assessmentHandler: null,
  scoreHandler: null,
  hasHydrated: false,
  currentPrincipal: null,
  coverLetterBuilder: defaultCoverLetterBuilder,
  coverLetterEditor: defaultCoverLetterEditor,

  analyticsHandler: null,
  analytics: {
    analyticsRange: "7d",
    overviewStats: null,
    viewsData: [],
    deviceData: [],
    locationData: [],
    trafficSources: [],
    topSections: [],
    recentActivity: [],

    setAnalyticsRange: (r) => set(s => ({ analytics: { ...s.analytics, analyticsRange: r } })),

    hydrateAnalytics: async (resumeId) => {
      const h = get().analyticsHandler;
      if (!h) return;

      // di state kamu sudah simpan "24h" | "7d" | ...
      const r = get().analytics.analyticsRange as TimeRange; // import from analyticsHandler

      try {
        // ⬇️ pakai API wrapper baru (tanpa .ok)
        const [ov, vw, dv, loc, src, sec, act] = await Promise.all([
          h.getOverview(resumeId, r),
          h.getViews(resumeId, r),
          h.getDevices(resumeId, r),
          h.getLocations(resumeId, r),
          h.getSources(resumeId, r),
          h.getSections(resumeId, r),
          h.getActivity(resumeId, 20),
        ]);

        // NOTE: tipe dari candid = bigint; untuk UI jadikan number
        set((s) => ({
          analytics: {
            ...s.analytics,
            overviewStats: {
              totalViews: Number(ov.totalViews),
              uniqueVisitors: Number(ov.uniqueVisitors),
              avgViewDurationMs: Number(ov.avgViewDurationMs),
              bounceRatePct: Number(ov.bounceRatePct),
              shareCount: Number(ov.shareCount),
              downloadCount: Number(ov.downloadCount),
            },
            viewsData: vw.map((p) => ({
              date: p.date,
              views: Number(p.views),
              visitors: Number(p.visitors),
              durationSecAvg: Number(p.durationSecAvg),
            })),
            deviceData: dv,          // sudah array of items
            locationData: loc,
            trafficSources: src,
            topSections: sec,
            recentActivity: act,
          },
        }));
      } catch (e) {
        console.error("Failed to hydrate analytics data:", e);
      }
    },


    trackViewStart: (resumeId) => {
      const h = get().analyticsHandler; if (!h) return;

      const rid = ensureRid();
      localStorage.setItem(startKey, String(Date.now()));

      h.track({
        resumeId,
        type: "VIEW",
        visitor: rid,
        ts: nowSec(),
        durationMs: 0,
        device: device,                         // <- optional; boleh hapus kalau tak perlu
        source: document.referrer || "Direct",  // <- string, bukan array
        // country: "ID",                        // <- optional
        // section: "Skills",                    // <- optional
      });
    },


    trackViewEnd: (resumeId) => {
      const h = get().analyticsHandler; if (!h) return;

      const rid = ensureRid();
      const started = Number(localStorage.getItem(startKey) || "0");
      const dur = started ? Math.max(0, Date.now() - started) : 0;
      localStorage.removeItem(startKey);

      h.track({
        resumeId,
        type: "VIEW",
        visitor: rid,
        ts: nowSec(),
        durationMs: dur,                        // <- number, bukan BigInt
        device: device,
        source: document.referrer || "Direct",
      });
    },

    trackShare: (resumeId) => {
      const h = get().analyticsHandler; if (!h) return;

      h.track({
        resumeId,
        type: "SHARE",
        visitor: ensureRid(),
        ts: nowSec(),
        device: device,
      });
    },


    trackDownload: (resumeId) => {
      const h = get().analyticsHandler; if (!h) return;

      h.track({
        resumeId,
        type: "DOWNLOAD",
        visitor: ensureRid(),
        ts: nowSec(),
        device: device,
      });
    },


    trackSectionView: (resumeId, section, durationMs) => {
      const h = get().analyticsHandler; if (!h) return;

      h.track({
        resumeId,
        type: "SECTION_VIEW",
        visitor: ensureRid(),
        ts: nowSec(),
        durationMs,       // number
        device: device,
        section,          // string, bukan array
      });
    },

  },

  // resume
  updateResume: (patch) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        ...patch
      },
    })),

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

  // ===== Assessment =====
  assessment: {},

  // setAssessmentResult: simpan di key baru; kalau testLevel belum ada, tetap aman
    setAssessmentResult: (r) =>
    set((s) => {
      // Pakai skillKey jika ada; fallback ke skillId
      const k = (r as any).skillKey ?? r.skillId;
      const newAssessment = {
        ...s.assessment,
        [assessmentKey(k, r.testLevel)]: r,
      };

      // Cari skill target:
      // 1) by exact id
      // 2) kalau gagal, by slug(name)
      const targetIdx = s.resumeData.skills.findIndex((sk) =>
        sk.id === r.skillId ||
        slugify(sk.name) === slugify((r as any).skillKey ?? r.skillName ?? "")
      );

      const skills = [...s.resumeData.skills];
      if (targetIdx !== -1) {
        const sk = skills[targetIdx];
        skills[targetIdx] = {
          ...sk,
          lastAssessmentScore: r.score,
          lastAssessmentLevel: r.level,
          lastAssessmentAt: r.dateISO,
        };
      }

      return {
        ...s,
        assessment: newAssessment,
        resumeData: { ...s.resumeData, skills },
      };
    }),

  // clearAssessmentForSkill: bisa hapus satu level, atau semua level utk skill tsb
    clearAssessmentForSkill: (skillId, testLevel) =>
    set((s) => {
      const next = { ...s.assessment };
      const k = slugify(skillId); // konsisten dengan key saat simpan

      if (testLevel) {
        delete next[assessmentKey(k, testLevel)];
      } else {
        for (const key of Object.keys(next)) {
          if (key === k || key.startsWith(`${k}::`)) delete next[key];
        }
      }
      return { ...s, assessment: next };
    }),

  clearAllAssessments: () => set((s) => ({ ...s, assessment: {} })),

  // hasCompletedAssessment: cek kunci baru & kunci lama (kompatibel)
  hasCompletedAssessment: (skillId, testLevel) => {
    const a = get().assessment;
    const k = slugify(skillId);

    if (testLevel) return !!a[assessmentKey(k, testLevel)];
    // kompatibel: per-skill (lama) atau per-skill::level (baru)
    return !!a[k] || Object.keys(a).some((key) => key.startsWith(`${k}::`));
  },


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
          assessment: {},          // ← hasil assessment direset
          skillBadges: {},
          resumeData: initialResumeData,
        }));
      }

      // set handlers
      set({
        resumeHandler: createResumeHandler(authClient),
        personalInfoHandler: createPersonalInfoHandler(authClient),
        workExperienceHandler: createWorkExperienceHandler(authClient),
        educationHandler: createEducationHandler(authClient),
        skillsHandler: createSkillsHandler(authClient),
        certificationHandler: createCertificationHandler(authClient),
        customSectionHandler: createCustomSectionHandler(authClient),
        socialHandler: createSocialHandler(authClient),
        coverLetterHandler: createCoverLetterHandler(authClient),
        atsHandler: createAtsHandler(authClient),
        scoreHandler: createResumeScoreHandler(authClient),
        assessmentHandler: createAssessmentHandler(authClient),
        analyticsHandler: createAnalyticsHandler(authClient)
      });

      // really only init handlers, fetch moved into src/frontend/src/components/ResumeForm.tsx
      // fetch data server untuk principal ini (handler sudah siap)
      // void get().fetchSkills?.();
      // void get().fetchCertifications?.();
    } catch (error) {
      console.error("Failed to initialize handlers:", error);
    }
  },

  areHandlersReady: () => {
    const state = get();
    return (
      state.resumeHandler &&
      state.personalInfoHandler &&
      state.workExperienceHandler &&
      state.educationHandler &&
      state.skillsHandler &&
      state.certificationHandler &&
      state.customSectionHandler &&
      state.socialHandler &&
      state.coverLetterHandler &&
      state.atsHandler &&
      state.scoreHandler &&
      state.analyticsHandler &&
      state.assessmentHandler
    ) != null;
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
      await handler.clientSave(get().resumeData.skills); // Skill[]
    } catch (err) {
      console.error("Failed to save all skills:", err);
      throw err;
    }
  },

  addSkill: async (skill) => {
    const handler = get().skillsHandler;
    if (!handler) throw new Error("Skills handler not initialized.");
    try {
      const lid = crypto.randomUUID();

      const tmpSkill = {
        ...skill,
        lid: lid,
        id: crypto.randomUUID(),
      };

      set((state) => ({
        resumeData: {
          ...state.resumeData,
          skills: [...state.resumeData.skills, tmpSkill],
        },
      }));

      const newSkill = await handler.clientAdd(lid, skill);

      set((state) => ({
        resumeData: {
          ...state.resumeData,
          skills: state.resumeData.skills.map((s) =>
            s.lid === lid
              ? {
                  ...s,
                  id: newSkill.id,     // id dari BE
                  lid: newSkill.lid,   // lid numeric dari BE (penting!)
                }
              : s
          ),
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

  // di store (useResumeStore)
  removeSkill: async (id) => {
    const handler = get().skillsHandler;
    if (!handler) throw new Error("Skills handler not initialized.");

    // 1) Optimistic remove di FE, NORMALISASI ke string
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        skills: state.resumeData.skills.filter(
          (s) => String(s.id) !== String(id)
        ),
      },
    }));

    try {
      // 2) Kalau masih temp/UUID → jangan panggil BE
      if (isTempId(id)) return;

      // BE kamu menerima id: string (DID: Text)
      const resId = await handler.clientDeleteById(String(id));
      // optional: bisa cek resId === String(id)
    } catch (err) {
      console.error("Failed to remove skill:", err);
      // (opsional) rollback kalau mau:
      // await get().fetchSkills();
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
      const lid = crypto.randomUUID();

      const tmpCert = {
        ...cert,
        lid: lid,
        id: crypto.randomUUID(),
      };

      set((state) => ({
        resumeData: {
          ...state.resumeData,
          certifications: [...state.resumeData.certifications, tmpCert],
        },
      }));

      const newCert = await handler.clientAdd(lid, cert);

      set((state) => ({
        resumeData: {
          ...state.resumeData,
          certifications: state.resumeData.certifications.map((c) =>
            c.lid === lid ? { ...c, id: newCert.id } : c
          ),
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
      set((state) => ({
        resumeData: {
          ...state.resumeData,
          certifications: state.resumeData.certifications.filter((c) => c.id !== id),
        },
      }));
      const ok = await handler.clientDeleteById(id);
      if (!ok) throw new Error("Backend reported failure to delete certification.");

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

  updateWorkExperienceId: (oldId: number | string, newId: number | string) => {
    const _old = Number(oldId); const _new = Number(newId);
    return set((state) => ({
      resumeData: {
        ...state.resumeData,
        workExperience: state.resumeData.workExperience.map((exp) =>
          exp.id === _old ? { ...exp, id: _new } as WorkExperience : exp
        ),
      },
    }));
  },

  updateWorkExperience: (id: number, experience: Partial<WorkExperience>) =>
  set((state) => ({
    resumeData: {
      ...state.resumeData,
      workExperience: state.resumeData.workExperience.map((exp) =>
        exp.id === id ? { ...exp, ...experience } : exp
      ),
    },
  })),

  removeWorkExperience: (id: number) =>
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

  addEducation: (education: Omit<Education, "id">) => 
  set((state) => ({
    resumeData: {
      ...state.resumeData,
      education: [
        ...state.resumeData.education,
        { ...education, id: nextId(state.resumeData.education) } as Education,
      ],
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

  updateEducationId: (lid, id) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        education: state.resumeData.education.map((edu) =>
          edu.lid === lid ? { ...edu, id: id } : edu
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
  addSocialLink: (socialLink: Omit<SocialLink, "id">) =>
  set((state) => ({
    resumeData: {
      ...state.resumeData,
      socialLinks: [
        ...state.resumeData.socialLinks,
        { ...socialLink, id: nextId(state.resumeData.socialLinks) } as SocialLink,
      ],
    },
  })),

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

  addCustomSection: (section: Omit<CustomSection, "id">) =>
  set((state) => ({
    resumeData: {
      ...state.resumeData,
      customSections: [
        ...state.resumeData.customSections,
        { ...section, id: nextId(state.resumeData.customSections) } as CustomSection,
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
    set(() => ({
      coverLetterBuilder: { ...builder },
    })),

  updateCoverLetterBuilder: (patch) =>
    set((state) => ({
      coverLetterBuilder: { ...state.coverLetterBuilder, ...patch },
    })),

  setCoverLetterEditor: (editor) =>
    set(() => ({
      coverLetterEditor: { ...editor },
    })),

  updateCoverLetterEditor: (patch) =>
    set((state) => ({
      coverLetterEditor: { ...state.coverLetterEditor, ...patch },
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
  | "assessment"         // ⬅️ persist
  | "coverLetterBuilder"    // <— tambahkan
  | "coverLetterEditor"     // <— tambahkan
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
        resumeData: s.resumeData,        // ⬅️ full
        selectedTemplate: s.selectedTemplate,
        isPrivate: s.isPrivate,
        currentPrincipal: s.currentPrincipal,
        atsScore: s.atsScore,
        atsCategories: s.atsCategories,
        resumeScoreOverall: s.resumeScoreOverall,
        resumeScoreCategories: s.resumeScoreCategories,
        resumeScoreImprovements: s.resumeScoreImprovements,
        assessment: s.assessment,
        coverLetterBuilder: s.coverLetterBuilder,
        coverLetterEditor: s.coverLetterEditor,
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

          if (!state.coverLetterBuilder) state.coverLetterBuilder = { ...defaultCoverLetterBuilder };
          if (!state.coverLetterEditor) state.coverLetterEditor = { ...defaultCoverLetterEditor };

          if (!state.assessment) state.assessment = {};
          if (!state.resumeData) state.resumeData = { skills: [] } as any;
          if (!state.resumeData.skills) state.resumeData.skills = [];

          // ⛔️ Jangan fetch di sini (handlers belum di-init).
          // Fetch dilakukan di initializeHandlers setelah handler tersedia.
        }
      },
    })
  )
);