import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AuthClient } from '@dfinity/auth-client';
// import { ActorSubclass, HttpAgent } from '@dfinity/agent';
// import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { createCertificationHandler } from '../lib/certificationHandler';
import { createSkillsHandler } from '../lib/skillsHandler'; // Pastikan ini terimpor

export type SkillLevel = string;

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
  id: string;
  name: string;
  level: SkillLevel; // Sekarang 'level' di 'Skill' adalah 'string'
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  date?: string;
}

export interface CustomSection {
  id: string;
  name: string;
  items: CustomSectionItem[];
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

export interface ResumeStore {
  resumeData: ResumeData;
  selectedTemplate: 'minimal' | 'modern' | 'professional';
  isPrivate: boolean;
  // --- Penambahan untuk Backend Integration ---
  certificationHandler: ReturnType<typeof createCertificationHandler> | null;
  skillsHandler: ReturnType<typeof createSkillsHandler> | null;
  initializeHandlers: (authClient: AuthClient) => void;
  // --- FUNGSI CRUD UNTUK SKILL ---
  fetchSkills: () => Promise<void>;
  saveAllSkills: () => Promise<void>; // <<< Tambahkan ini: Untuk menyimpan semua skill ke backend (batch update)
  addSkill: (skill: Omit<Skill, 'id'>) => Promise<void>;
  updateSkill: (id: string, skill: Partial<Omit<Skill, 'id'>>) => void; // <<< Tidak lagi async, hanya update lokal
  removeSkill: (id: string) => Promise<void>;

  // --- FUNGSI CRUD UNTUK CERTIFICATION (tetap sama) ---
  fetchCertifications: () => Promise<void>;
  saveAllCertifications: () => Promise<void>;
  addCertification: (cert: Omit<Certification, 'id'>) => Promise<void>;
  updateCertification: (id: string, cert: Partial<Omit<Certification, 'id'>>) => void; // Tidak async
  removeCertification: (id: string) => Promise<void>;
  // --- Akhir Penambahan ---
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  setWorkExperience: (experiences: WorkExperience[]) => void;
  addWorkExperience: (experience: WorkExperience) => void;
  updateWorkExperience: (id: string, experience: Partial<WorkExperience>) => void;
  removeWorkExperience: (id: string) => void;
  setEducation: (experiences: Education[]) => void;
  addEducation: (education: Education) => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addSocialLink: (socialLink: Omit<SocialLink, 'id'>) => void;
  updateSocialLink: (id: string, socialLink: Partial<SocialLink>) => void;
  removeSocialLink: (id: string) => void;
  addCustomSection: (section: Omit<CustomSection, 'id'>) => void;
  updateCustomSection: (id: string, section: Partial<CustomSection>) => void;
  removeCustomSection: (id: string) => void;
  setTemplate: (template: 'minimal' | 'modern' | 'professional') => void;
  setPrivacy: (isPrivate: boolean) => void;
}

const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    bio: '',
  },
  workExperience: [
  ],
  education: [
  ],
  skills: [
  ],
  certifications: [
  ],
  socialLinks: [
    {
      id: '1',
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/johndoe',
    },
    {
      id: '2',
      platform: 'GitHub',
      url: 'https://github.com/johndoe',
    },
  ],
  customSections: [],
};

export const useResumeStore = create<ResumeStore>()(
  devtools(
    (set, get) => ({
      resumeData: initialResumeData,
      selectedTemplate: 'modern',
      isPrivate: false,

  // --- Implementasi Backend Integration ---
  certificationHandler: null, // Default null, akan diinisialisasi
  skillsHandler: null,
  initializeHandlers: (authClient: AuthClient) => {
        try {
          const certHandler = createCertificationHandler(authClient);
          const skillHandler = createSkillsHandler(authClient); // Inisialisasi skillsHandler

          set({
            certificationHandler: certHandler,
            skillsHandler: skillHandler,
          });

          // Setelah handlers diinisialisasi, fetch data awal
          // get().fetchPersonalInfo();
          // get().fetchCertifications();
          // get().fetchSkills(); // Panggil fetchSkills
          // get().fetchWorkExperience();
          // get().fetchEducation();
          // get().fetchSocialLinks();
          // get().fetchCustomSections();

        } catch (error) {
          console.error("Failed to initialize handlers:", error);
          toast.error(`Initialization failed: ${(error as Error).message || error}`);
        }
      },

  fetchCertifications: async () => {
    const handler = get().certificationHandler;
    if (!handler) {
      console.error("Certification handler not initialized.");
      // Anda bisa throw error atau mengembalikan Promise.reject() di sini
      // agar komponen yang memanggil bisa menangani error
      throw new Error("Certification handler not initialized.");
    }
    try {
      const fetchedCerts = await handler.clientGetAll();
      set(state => ({
      resumeData: {
        ...state.resumeData,
        // Ini adalah type assertion sebagai upaya terakhir jika TypeScript masih salah
        certifications: fetchedCerts as Certification[], 
      },
    }));
    } catch (error) {
      console.error("Failed to fetch certifications:", error);
      throw error; // Re-throw for component to catch and show toast
    }
  },

  saveAllCertifications: async () => {
    const handler = get().certificationHandler;
    if (!handler) {
      console.error("Certification handler not initialized.");
      throw new Error("Certification handler not initialized.");
    }
    try {
      const currentCerts = get().resumeData.certifications;
      await handler.clientSave(currentCerts); // Ini akan memanggil clientBatchUpdate di handler
      // Opsional: fetch ulang setelah save jika ada kemungkinan perubahan di backend
      // await get().fetchCertifications();
    } catch (error) {
      console.error("Failed to save all certifications:", error);
      throw error; // Re-throw for component to catch and show toast
    }
  },
  // --- Akhir Implementasi Backend Integration ---

  fetchSkills: async () => {
        const handler = get().skillsHandler;
        if (!handler) { toast.error("Skills service not ready."); return; }
        try {
          const fetchedSkills = await handler.clientGetAllSkills();
          set(state => ({ resumeData: { ...state.resumeData, skills: fetchedSkills } }));
          toast.success("Skills loaded!");
        } catch (error) {
          console.error("Failed to fetch skills:", error);
          toast.error(`Failed to load skills: ${(error as Error).message || error}`);
        }
      },

  saveAllSkills: async () => {
    const handler = get().skillsHandler;
    if (!handler) { toast.error("Skills service not ready. Cannot save skills."); return; }
    try {
        const currentSkills = get().resumeData.skills;
        // Ganti handler.clientSave menjadi handler.clientBatchUpdateSkills
        await handler.clientBatchUpdateSkills(currentSkills);
        toast.success('All Skills saved successfully!');
    } catch (error) {
        console.error("Failed to save all skills:", error);
        toast.error(`Failed to save all skills: ${(error as Error).message || error}`);
    }
},

  addSkill: async (skillData) => {
    const handler = get().skillsHandler;
    if (!handler) { toast.error("Skills service not ready. Cannot add skill."); return; }
    try {
        // Ganti handler.clientAdd menjadi handler.clientAddSkill
        const newSkill = await handler.clientAddSkill(skillData);
        set(state => ({ resumeData: { ...state.resumeData, skills: [...state.resumeData.skills, newSkill] } }));
        toast.success('Skill added successfully!');
    } catch (error) {
        console.error("Failed to add skill:", error);
        toast.error(`Failed to add skill: ${(error as Error).message || error}`);
    }
},
    
  updateSkill: (id, updatedFields) => {
        set((state) => ({
          resumeData: {
            ...state.resumeData,
            skills: state.resumeData.skills.map((s) => (s.id === id ? { ...s, ...updatedFields } : s)),
          },
        }));
        toast.info("Skill updated locally. Remember to call `saveAllSkills` to sync with backend.");
      },

      removeSkill: async (id) => {
        const handler = get().skillsHandler;
        if (!handler) { toast.error("Skills service not ready. Cannot remove skill."); return; }
        try {
          const success = await handler.clientDeleteById(id);
          if (success) {
            set(state => ({ resumeData: { ...state.resumeData, skills: state.resumeData.skills.filter(s => s.id !== id) } }));
            toast.success('Skill removed successfully!');
          } else {
            toast.error('Failed to remove skill from backend.');
          }
        } catch (error) {
          console.error("Error in removeSkill:", error);
          toast.error(`Failed to remove skill: ${(error as Error).message || error}`);
        }
      },

  updatePersonalInfo: (info) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        personalInfo: { ...state.resumeData.personalInfo, ...info },
      },
    })),

  setWorkExperience: (experiences) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        workExperience: experiences,
      },
    })),

  addWorkExperience: (experience) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        workExperience: [
          ...state.resumeData.workExperience, experience,
        ],
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

  setEducation: (educations) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        education: educations,
      },
    })),

  addEducation: (education) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        education: [
          ...state.resumeData.education, education,
        ],
      },
    })),

  updateEducation: (id, education) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        education: state.resumeData.education.map((edu) =>
          edu.id === id ? { ...edu, ...education } : edu
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

  // --- Implementasi addCertification yang diubah untuk Backend ---
  addCertification: async (cert: Omit<Certification, 'id'>) => { // Perhatikan 'async'
    const handler = get().certificationHandler;
    if (!handler) {
      console.error("Certification handler not initialized.");
      throw new Error("Certification handler not initialized."); // Penting untuk throw error
    }
    try {
      const newCertWithId = await handler.clientAdd(cert); // Panggil backend
      set(state => ({
        resumeData: {
          ...state.resumeData,
          certifications: [...state.resumeData.certifications, newCertWithId],
        },
      }));
    } catch (error) {
      console.error("Failed to add certification to backend:", error);
      throw error; // Re-throw for component to handle
    }
  },

  updateCertification: (id, certification) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        certifications: state.resumeData.certifications.map((cert) =>
          cert.id === id ? { ...cert, ...certification } : cert
        ),
      },
    })),

  // --- Implementasi removeCertification yang diubah untuk Backend ---
  removeCertification: async (id: string) => { // Perhatikan 'async'
    const handler = get().certificationHandler;
    if (!handler) {
      console.error("Certification handler not initialized.");
      throw new Error("Certification handler not initialized.");
    }
    try {
      const success = await handler.clientDeleteById(id); // Panggil backend
      if (success) {
        set(state => ({
          resumeData: {
            ...state.resumeData,
            certifications: state.resumeData.certifications.filter((cert) => cert.id !== id),
          },
        }));
      } else {
        throw new Error("Backend reported failure to delete certification.");
      }
    } catch (error) {
      console.error("Failed to remove certification from backend:", error);
      throw error;
    }
  },

  addSocialLink: (socialLink) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        socialLinks: [
          ...state.resumeData.socialLinks,
          { ...socialLink, id: Date.now().toString() },
        ],
      },
    })),

  updateSocialLink: (id, socialLink) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        socialLinks: state.resumeData.socialLinks.map((link) =>
          link.id === id ? { ...link, ...socialLink } : link
        ),
      },
    })),

  removeSocialLink: (id) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        socialLinks: state.resumeData.socialLinks.filter((link) => link.id !== id),
      },
    })),

  addCustomSection: (section) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        customSections: [
          ...state.resumeData.customSections,
          { ...section, id: Date.now().toString() },
        ],
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

  setTemplate: (template) => set({ selectedTemplate: template }),
  setPrivacy: (isPrivate) => set({ isPrivate }),
}))
);
