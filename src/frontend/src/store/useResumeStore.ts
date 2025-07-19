import { create } from 'zustand';
import type { AuthClient } from '@dfinity/auth-client';
import { createCertificationHandler } from '../lib/certificationHandler';

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
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
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
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    bio: string;
    photoUrl?: string;
  };
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  socialLinks: SocialLink[];
  customSections: CustomSection[];
}

interface ResumeStore {
  resumeData: ResumeData;
  selectedTemplate: 'minimal' | 'modern' | 'professional';
  isPrivate: boolean;
  // --- Penambahan untuk Backend Integration ---
  certificationHandler: ReturnType<typeof createCertificationHandler> | null;
  initializeHandlers: (authClient: AuthClient) => void;
  fetchCertifications: () => Promise<void>; // Fungsi untuk mengambil data dari backend
  saveAllCertifications: () => Promise<void>; // Fungsi untuk menyimpan semua sertifikasi ke backend (batch update)
  // --- Akhir Penambahan ---
  updatePersonalInfo: (info: Partial<ResumeData['personalInfo']>) => void;
  setWorkExperience: (experiences: WorkExperience[]) => void;
  addWorkExperience: (experience: WorkExperience) => void;
  updateWorkExperience: (id: string, experience: Partial<WorkExperience>) => void;
  removeWorkExperience: (id: string) => void;
  setEducation: (experiences: Education[]) => void;
  addEducation: (education: Education) => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  // --- Modifikasi Tipe Fungsi untuk Backend ---
  addCertification: (certification: Omit<Certification, 'id'>) => Promise<void>; // Sekarang async
  updateCertification: (id: string, certification: Partial<Certification>) => void;
  removeCertification: (id: string) => Promise<void>; // Sekarang async
  // --- Akhir Modifikasi ---
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
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    bio: 'Passionate software engineer with 5+ years of experience in full-stack development. Specialized in React, Node.js, and cloud technologies.',
  },
  workExperience: [
    {
      id: '1',
      jobTitle: 'Senior Software Engineer',
      company: 'Tech Corp',
      startDate: '2022-01',
      endDate: '',
      current: true,
      description: 'Led development of scalable web applications using React and Node.js. Mentored junior developers and improved system performance by 40%.',
    },
    {
      id: '2',
      jobTitle: 'Software Engineer',
      company: 'StartupXYZ',
      startDate: '2020-03',
      endDate: '2021-12',
      current: false,
      description: 'Built responsive frontend applications and RESTful APIs. Collaborated with design team to implement pixel-perfect UIs.',
    },
  ],
  education: [
    {
      id: '1',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of California, Berkeley',
      graduationDate: '2020-05',
      gpa: '3.8',
    },
  ],
  skills: [
    { id: '1', name: 'JavaScript', level: 'Expert' },
    { id: '2', name: 'React', level: 'Expert' },
    { id: '3', name: 'Node.js', level: 'Advanced' },
    { id: '4', name: 'TypeScript', level: 'Advanced' },
    { id: '5', name: 'Python', level: 'Intermediate' },
  ],
  certifications: [
    {
      id: '1',
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      date: '2023-06',
      credentialId: 'AWS-DEV-2023-001', // Ini benar untuk tipe frontend
    },
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

export const useResumeStore = create<ResumeStore>((set, get) => ({ // <-- Tambahkan 'get' di sini
  resumeData: initialResumeData,
  selectedTemplate: 'modern',
  isPrivate: false,

  // --- Implementasi Backend Integration ---
  certificationHandler: null, // Default null, akan diinisialisasi
  initializeHandlers: (authClient: AuthClient) => {
    const handler = createCertificationHandler(authClient);
    set({ certificationHandler: handler });
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

  addSkill: (skill) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        skills: [...state.resumeData.skills, { ...skill, id: Date.now().toString() }],
      },
    })),

  updateSkill: (id, skill) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        skills: state.resumeData.skills.map((s) => (s.id === id ? { ...s, ...skill } : s)),
      },
    })),

  removeSkill: (id) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        skills: state.resumeData.skills.filter((skill) => skill.id !== id),
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
}));
