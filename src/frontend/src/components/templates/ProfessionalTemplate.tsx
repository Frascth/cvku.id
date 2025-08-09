
import React from 'react';
import { ResumeData } from '../../store/useResumeStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Linkedin, Github, Twitter, Globe, Instagram, Facebook } from 'lucide-react';

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
                {skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{skill.name}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full"
                        style={{ 
                          backgroundColor: currentTheme.colors.accent,
                          width: skill.level === 'Expert' ? '100%' : 
                                 skill.level === 'Advanced' ? '80%' : 
                                 skill.level === 'Intermediate' ? '60%' : '40%' 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs opacity-70 mt-1">{skill.level}</div>
                  </div>
                ))}
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
