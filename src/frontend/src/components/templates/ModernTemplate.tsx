
import React from 'react';
import { ResumeData } from '../../store/useResumeStore';
import { useThemeStore } from '../../store/useThemeStore';

interface ModernTemplateProps {
  data: ResumeData;
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ data }) => {
  const { personalInfo, workExperience, education, skills, certifications } = data;
  const { currentTheme, currentFont } = useThemeStore();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const getSkillColor = (level: string) => {
    switch (level) {
      case 'Expert': return currentTheme.colors.primary;
      case 'Advanced': return currentTheme.colors.secondary;
      case 'Intermediate': return currentTheme.colors.accent;
      case 'Beginner': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const themeStyles = {
    fontFamily: currentFont.family,
    color: currentTheme.colors.text,
    backgroundColor: currentTheme.colors.background
  };

  return (
    <div className="max-w-2xl mx-auto bg-white text-gray-900" style={themeStyles}>
      {/* Header */}
      <div 
        className="text-white p-8"
        style={{ 
          background: `linear-gradient(135deg, ${currentTheme.colors.primary} 0%, ${currentTheme.colors.secondary} 100%)` 
        }}
      >
        <h1 className="text-4xl font-bold mb-2">{personalInfo.fullName}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm opacity-90">
          <div>
            <div>{personalInfo.email}</div>
            <div>{personalInfo.phone}</div>
          </div>
          <div>
            <div>{personalInfo.location}</div>
            {personalInfo.website && <div>{personalInfo.website}</div>}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Bio */}
        {personalInfo.bio && (
          <div>
            <h2 
              className="text-xl font-bold mb-3 border-b-2 pb-1"
              style={{ 
                color: currentTheme.colors.text,
                borderColor: currentTheme.colors.accent 
              }}
            >
              About
            </h2>
            <p className="leading-relaxed" style={{ color: currentTheme.colors.text }}>
              {personalInfo.bio}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <div>
            <h2 
              className="text-xl font-bold mb-4 border-b-2 pb-1"
              style={{ 
                color: currentTheme.colors.text,
                borderColor: currentTheme.colors.accent 
              }}
            >
              Experience
            </h2>
            <div className="space-y-6">
              {workExperience.map((exp) => (
                <div key={exp.id} className="relative pl-6" style={{ borderLeft: `2px solid ${currentTheme.colors.accent}` }}>
                  <div 
                    className="absolute w-3 h-3 rounded-full -left-2 top-1"
                    style={{ backgroundColor: currentTheme.colors.primary }}
                  ></div>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
                        {exp.jobTitle}
                      </h3>
                      <div className="font-medium" style={{ color: currentTheme.colors.primary }}>
                        {exp.company}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 md:mt-0">
                      {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </div>
                  </div>
                  <p className="leading-relaxed" style={{ color: currentTheme.colors.text }}>
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
              className="text-xl font-bold mb-4 border-b-2 pb-1"
              style={{ 
                color: currentTheme.colors.text,
                borderColor: currentTheme.colors.accent 
              }}
            >
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: currentTheme.colors.text }}>
                      {edu.degree}
                    </h3>
                    <div className="font-medium" style={{ color: currentTheme.colors.primary }}>
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
          <div>
            <h2 
              className="text-xl font-bold mb-4 border-b-2 pb-1"
              style={{ 
                color: currentTheme.colors.text,
                borderColor: currentTheme.colors.accent 
              }}
            >
              Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium" style={{ color: currentTheme.colors.text }}>
                        {skill.name}
                      </span>
                      <span className="text-sm text-gray-500">{skill.level}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          backgroundColor: getSkillColor(skill.level),
                          width: skill.level === 'Expert' ? '100%' : 
                                 skill.level === 'Advanced' ? '80%' : 
                                 skill.level === 'Intermediate' ? '60%' : '40%' 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <h2 
              className="text-xl font-bold mb-4 border-b-2 pb-1"
              style={{ 
                color: currentTheme.colors.text,
                borderColor: currentTheme.colors.accent 
              }}
            >
              Certifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold" style={{ color: currentTheme.colors.text }}>
                    {cert.name}
                  </h3>
                  <div className="font-medium" style={{ color: currentTheme.colors.primary }}>
                    {cert.issuer}
                  </div>
                  <div className="text-sm text-gray-500">{formatDate(cert.date)}</div>
                  {cert.credentialId && (
                    <div className="text-xs text-gray-400 mt-1">ID: {cert.credentialId}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
