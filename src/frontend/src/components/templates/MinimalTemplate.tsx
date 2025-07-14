
import React from 'react';
import { ResumeData } from '../../store/useResumeStore';
import { useThemeStore } from '../../store/useThemeStore';

interface MinimalTemplateProps {
  data: ResumeData;
}

export const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ data }) => {
  const { personalInfo, workExperience, education, skills, certifications } = data;
  const { currentTheme, currentFont } = useThemeStore();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const themeStyles = {
    fontFamily: currentFont.family,
    color: currentTheme.colors.text,
    backgroundColor: currentTheme.colors.background
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white" style={themeStyles}>
      {/* Header */}
      <div className="text-center pb-6 mb-6" style={{ borderBottom: `1px solid ${currentTheme.colors.accent}` }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: currentTheme.colors.primary }}>
          {personalInfo.fullName}
        </h1>
        <div className="text-sm space-y-1" style={{ color: currentTheme.colors.text, opacity: 0.8 }}>
          <div>{personalInfo.email} • {personalInfo.phone}</div>
          <div>{personalInfo.location}</div>
          {personalInfo.website && <div>{personalInfo.website}</div>}
        </div>
      </div>

      {/* Bio */}
      {personalInfo.bio && (
        <div className="mb-6">
          <p className="text-sm leading-relaxed" style={{ color: currentTheme.colors.text }}>
            {personalInfo.bio}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-lg font-bold mb-3 uppercase tracking-wide"
            style={{ color: currentTheme.colors.primary }}
          >
            Experience
          </h2>
          <div className="space-y-4">
            {workExperience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold" style={{ color: currentTheme.colors.text }}>
                      {exp.jobTitle}
                    </h3>
                    <div className="text-sm" style={{ color: currentTheme.colors.secondary }}>
                      {exp.company}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
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
        <div className="mb-6">
          <h2 
            className="text-lg font-bold mb-3 uppercase tracking-wide"
            style={{ color: currentTheme.colors.primary }}
          >
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold" style={{ color: currentTheme.colors.text }}>
                    {edu.degree}
                  </h3>
                  <div className="text-sm" style={{ color: currentTheme.colors.secondary }}>
                    {edu.institution}
                  </div>
                  {edu.gpa && <div className="text-sm text-gray-500">GPA: {edu.gpa}</div>}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(edu.graduationDate)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-lg font-bold mb-3 uppercase tracking-wide"
            style={{ color: currentTheme.colors.primary }}
          >
            Skills
          </h2>
          <div className="text-sm">
            {skills.map((skill, index) => (
              <span key={skill.id} style={{ color: currentTheme.colors.text }}>
                {skill.name}
                {index < skills.length - 1 && (
                  <span style={{ color: currentTheme.colors.accent }}> • </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-6">
          <h2 
            className="text-lg font-bold mb-3 uppercase tracking-wide"
            style={{ color: currentTheme.colors.primary }}
          >
            Certifications
          </h2>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: currentTheme.colors.text }}>
                    {cert.name}
                  </h3>
                  <div className="text-sm" style={{ color: currentTheme.colors.secondary }}>
                    {cert.issuer}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(cert.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
