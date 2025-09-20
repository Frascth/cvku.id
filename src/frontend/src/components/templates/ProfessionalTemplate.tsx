
import React from 'react';
import { ResumeData } from '../../store/useResumeStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Linkedin, Github, Twitter, Globe, Instagram, Facebook } from 'lucide-react';
import { useResumeStore } from "@/store/useResumeStore";

interface ProfessionalTemplateProps {
  data: ResumeData;
}

export const ProfessionalTemplate: React.FC<ProfessionalTemplateProps> = ({ data }) => {
  const { personalInfo, workExperience, education, skills, certifications, socialLinks } = data;
  const { currentTheme, currentFont } = useThemeStore();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return Linkedin;
      case 'github': return Github;
      case 'twitter': return Twitter;
      case 'instagram': return Instagram;
      case 'facebook': return Facebook;
      default: return Globe;
    }
  };

  const themeStyles = {
    fontFamily: currentFont.family,
    color: currentTheme.colors.text,
    backgroundColor: currentTheme.colors.background
  };

  const assessment = useResumeStore(s => s.assessment);

  const slugify = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "-");

  function latestAssessmentForSkill(name: string) {
    const key = slugify(name);                 // contoh: "JavaScript" -> "javascript"
    const exact = assessment[key];             // kunci lama: "javascript"
    if (exact) return exact as any;

    // kunci baru: "javascript::Intermediate" dst — ambil yang terbaru
    const pref = Object.entries(assessment)
      .filter(([k]) => k.startsWith(`${key}::`))
      .map(([, v]) => v as any)
      .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
    return pref[0] ?? null;
  }

  // fallback cari by id, kalau id FE beda dengan skillId di assessment, coba fallback by name
  const getAssess = (sk: { id: string; name: string }) =>
    assessment[sk.id] || assessment[sk.name.toLowerCase()];

  // urutan level yang mau ditampilkan
  const labelFromScore = (n: number) =>
    n >= 90 ? "Excellent"
      : n >= 75 ? "Good"
        : n >= 55 ? "Fair"
          : n >= 35 ? "Poor"
            : "Very Poor";


  return (
    <div className="max-w-2xl mx-auto bg-white text-gray-900 grid grid-cols-3 gap-0 min-h-[800px]" style={themeStyles}>
      {/* Sidebar */}
      <div
        className="col-span-1 text-white p-6"
        style={{ backgroundColor: currentTheme.colors.secondary }}
      >
        <div className="space-y-6">
          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-3 opacity-80">
              Contact
            </h3>
            <div className="space-y-2 text-sm">
              <div className="break-words">{personalInfo.email}</div>
              <div>{personalInfo.phone}</div>
              <div>{personalInfo.location}</div>
              {personalInfo.website && <div className="break-words">{personalInfo.website}</div>}
            </div>
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-3 opacity-80">
                Social
              </h3>
              <div className="space-y-2">
                {socialLinks.map((link) => {
                  const IconComponent = getSocialIcon(link.platform);
                  return (
                    <div key={link.id} className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm truncate">{link.platform}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-3 opacity-80">
                Skills
              </h3>

              <div className="space-y-3">
                {skills.map((skill) => {
                  const slugify = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "-");
                  const assessment = useResumeStore(s => s.assessment);
                  const key = slugify(skill.name);

                  const exact = assessment[key] as any;
                  const prefixed = Object.entries(assessment)
                    .filter(([k]) => k.startsWith(`${key}::`))
                    .map(([, v]) => v as any)
                    .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
                  const latest = exact ?? prefixed[0] ?? null;

                  const score =
                    Number.isFinite(skill.lastAssessmentScore)
                      ? Number(skill.lastAssessmentScore)
                      : (Number.isFinite(latest?.score) ? Number(latest.score) : null);

                  const level = skill.lastAssessmentLevel ?? latest?.level ?? null;
                  const hasScore = Number.isFinite(score as number);
                  const progress = hasScore ? (score as number) : 0; // bar tetap ada; 0% jika belum

                  return (
                    <div key={skill.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{skill.name}</span>
                        {hasScore && <span className="text-xs opacity-70">{level}</span>}
                      </div>

                      {/* progress bar mengikuti desainmu */}
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ backgroundColor: currentTheme.colors.accent, width: `${progress}%` }}
                        />
                      </div>

                      {/* teks hasil assessment di bawah bar */}
                      {hasScore ? (
                        <div className="mt-0.5 text-xs text-gray-500">
                          Result Assessment:{" "}
                          <span className="font-medium" style={{ color: currentTheme.colors.text }}>
                            {score}% ({labelFromScore(score)})
                          </span>
                        </div>
                      ) : (
                        <div className="mt-0.5 text-xs text-gray-500">
                          <span className="ml-2 text-xs text-gray-400">(Skor belum tersedia)</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-3 opacity-80">
                Certifications
              </h3>
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <div key={cert.id}>
                    <h4 className="text-sm font-medium">{cert.name}</h4>
                    <div className="text-xs opacity-70">{cert.issuer}</div>
                    <div className="text-xs opacity-70">{formatDate(cert.date)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-2 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: currentTheme.colors.primary }}>
            {personalInfo.fullName}
          </h1>
          {personalInfo.bio && (
            <p className="leading-relaxed text-sm" style={{ color: currentTheme.colors.text }}>
              {personalInfo.bio}
            </p>
          )}
        </div>

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <div className="mb-8">
            <h2
              className="text-lg font-bold mb-4 uppercase tracking-wide border-b pb-2"
              style={{
                color: currentTheme.colors.primary,
                borderColor: currentTheme.colors.accent
              }}
            >
              Professional Experience
            </h2>
            <div className="space-y-6">
              {workExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="mb-2">
                    <h3 className="text-base font-bold" style={{ color: currentTheme.colors.text }}>
                      {exp.jobTitle}
                    </h3>
                    <div className="flex justify-between items-center">
                      <div className="font-semibold" style={{ color: currentTheme.colors.secondary }}>
                        {exp.company}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: currentTheme.colors.text }}>
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2
              className="text-lg font-bold mb-4 uppercase tracking-wide border-b pb-2"
              style={{
                color: currentTheme.colors.primary,
                borderColor: currentTheme.colors.accent
              }}
            >
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold" style={{ color: currentTheme.colors.text }}>
                        {edu.degree}
                      </h3>
                      <div className="font-semibold" style={{ color: currentTheme.colors.secondary }}>
                        {edu.institution}
                      </div>
                      {edu.gpa && <div className="text-sm text-gray-600">GPA: {edu.gpa}</div>}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(edu.graduationDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
